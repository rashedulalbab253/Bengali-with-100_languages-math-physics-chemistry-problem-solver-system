// Configuration
const API_BASE_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:8000/api"
    : "/api";

// State
let uploadedFileBase64 = null;
let lastDetailedSolution = "";
let currentProblemText = "";

// DOM Elements
const mathInput = document.getElementById('math-question-input');
const fileInput = document.getElementById('fileInput');
const fileNameDisplay = document.getElementById('fileNameDisplay');
const clearFileButton = document.getElementById('clearFileButton');
const solveButton = document.getElementById('solveButton');
const explainButton = document.getElementById('explainButton');
const outputDiv = document.getElementById('detailed-solution-output');
const languageSelect = document.getElementById('outputLanguage');
const languagePrompt = document.getElementById('language-prompt');
const loadingStatus = document.getElementById('loadingStatus');

// --- Initialization ---

// Remove glow effect on language change
languageSelect.addEventListener('change', () => {
    languagePrompt.classList.remove('language-glow-prompt');
});

// --- File Handling ---

fileInput.addEventListener('change', async (event) => {
    try {
        const file = event.target.files[0];
        if (file) {
            // 10MB limit
            if (file.size > 10 * 1024 * 1024) {
                alert("File size exceeds 10MB limit. Please choose a smaller image.");
                clearFile();
                return;
            }

            // Update UI immediately
            fileNameDisplay.textContent = 'File selected: ' + file.name;
            fileNameDisplay.classList.remove('text-gray-500');
            fileNameDisplay.classList.add('text-indigo-600', 'font-medium');
            clearFileButton.disabled = false;

            // Convert to Base64
            uploadedFileBase64 = await fileToBase64(file);

            // Auto-update input if empty
            if (!mathInput.value.trim()) {
                mathInput.value = 'Please solve the problem in this image.';
            }
        }
    } catch (error) {
        console.error("File selection error:", error);
        alert("Failed to process file. Please try again.");
        clearFile();
    }
});

clearFileButton.addEventListener('click', clearFile);

function clearFile() {
    uploadedFileBase64 = null;
    fileInput.value = '';

    fileNameDisplay.textContent = 'No file selected.';
    fileNameDisplay.classList.add('text-gray-500');
    fileNameDisplay.classList.remove('text-indigo-600', 'font-medium');

    clearFileButton.disabled = true;
    if (mathInput.value === 'Please solve the problem in this image.') {
        mathInput.value = '';
    }
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                // Compress and resize the image
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // Set maximum dimensions
                const MAX_WIDTH = 1200;
                const MAX_HEIGHT = 1200;
                let width = img.width;
                let height = img.height;

                // Calculate the new dimensions while maintaining aspect ratio
                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height = Math.round((height * MAX_WIDTH) / width);
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width = Math.round((width * MAX_HEIGHT) / height);
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                // Draw image on canvas
                ctx.drawImage(img, 0, 0, width, height);

                // Export as compressed JPEG (0.8 quality = good balance of size and legibility)
                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
                resolve(compressedBase64);
            };
            img.onerror = (error) => reject(error);
            img.src = event.target.result;
        };
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

// --- API Calls ---

solveButton.addEventListener('click', () => solveProblem(false));
explainButton.addEventListener('click', () => solveProblem(true));

async function solveProblem(isExplainMode) {
    const input = mathInput.value.trim();
    const outputLanguage = languageSelect.value;

    // Validation
    if (!input && !uploadedFileBase64 && !isExplainMode) {
        alert("Please enter a problem or upload an image to solve.");
        return;
    }

    if (isExplainMode && !lastDetailedSolution) {
        alert("Please solve a problem first to get an explanation!");
        return;
    }

    // UI Updates
    setLoading(true, isExplainMode);
    outputDiv.innerHTML = isExplainMode ? "Generating easier explanation..." : "Solving problem...";

    try {
        let endpoint = isExplainMode ? "/explain" : "/solve";
        let payload = {};

        if (isExplainMode) {
            payload = {
                problem: currentProblemText,
                solution: lastDetailedSolution,
                language: outputLanguage
            };
        } else {
            currentProblemText = input;
            payload = {
                problem: input,
                language: outputLanguage,
                image_data: uploadedFileBase64
            };
        }

        console.log("🚀 Making API request to:", `${API_BASE_URL}${endpoint}`);
        console.log("📦 Payload:", payload);

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        console.log("📡 Response status:", response.status);

        if (!response.ok) {
            const error = await response.json();
            console.error("❌ Server error response:", error);
            throw new Error(error.detail || "Server error occurred");
        }

        const data = await response.json();
        console.log("✅ Success! Response data:", data);
        const resultText = isExplainMode ? data.explanation : data.solution;

        // Render result with simple line break replacement (since it's not markdown-enabled yet)
        outputDiv.innerHTML = formatAIResponse(resultText);

        if (!isExplainMode) {
            lastDetailedSolution = resultText;
        }

    } catch (error) {
        console.error("❌ API Error:", error);
        outputDiv.innerHTML = `<span class="text-red-500 font-bold">Error:</span> ${error.message}. <br><br>Make sure the FastAPI backend is running!`;
    } finally {
        setLoading(false);
    }
}

function setLoading(isLoading, isExplainMode = false) {
    solveButton.disabled = isLoading;
    explainButton.disabled = isLoading;
    loadingStatus.classList.toggle('hidden', !isLoading);

    if (isLoading) {
        loadingStatus.innerHTML = isExplainMode
            ? '<span class="inline-block mr-2">💡</span>Simplifying for you...'
            : '<span class="inline-block mr-2">⚙️</span>AI is calculating...';
    }
}

function formatAIResponse(text) {
    // 1. Replace newlines with <br> for spacing
    let formatted = text.replace(/\n/g, '<br>');

    // 2. Format bold text: **text** -> <strong>text</strong>
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="text-indigo-700">$1</strong>');

    // 3. Format math symbols: $x$ -> <span class="math-symbol">x</span> (Simple styling)
    formatted = formatted.replace(/\$(.*?)\$/g, '<em class="font-serif text-lg bg-gray-100 px-1 rounded">$1</em>');

    // 4. Format headers: ### Header -> <h3>Header</h3>
    formatted = formatted.replace(/### (.*?)(<br>|$)/g, '<h3 class="text-xl font-bold text-gray-800 mt-4 mb-2">$1</h3>');

    // 5. Basic markdown bold
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // 6. Basic formatting for italic
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');

    return formatted;
}
