let selectedFile = null;
let pdfBlob = null;
let pdfFileName = "";
let cleanHTML = "";

const selectBtn = document.getElementById('selectBtn');
const fileInput = document.getElementById('fileInput');
const previewBtn = document.getElementById('previewBtn');
const convertBtn = document.getElementById('convertBtn');
const shareBtn = document.getElementById('shareBtn');
const fileInfo = document.getElementById('fileInfo');
const fileNameEl = document.getElementById('fileName');
const statusEl = document.getElementById('status');
const previewSection = document.getElementById('previewSection');
const livePreview = document.getElementById('livePreview');

selectBtn.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', e => {
    selectedFile = e.target.files[0];

    if (selectedFile && selectedFile.name.toLowerCase().endsWith('.docx')) {
        fileNameEl.textContent = selectedFile.name;
        fileInfo.classList.remove('d-none');
        previewBtn.disabled = false;
        showStatus('✅ File selected', 'success');
    } else {
        showStatus('❌ Only .docx files allowed', 'danger');
    }
});

// PREVIEW
previewBtn.addEventListener('click', async () => {
    const arrayBuffer = await selectedFile.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });

    cleanHTML = result.value;

    livePreview.innerHTML = `<div class="a4">${cleanHTML}</div>`;
    previewSection.classList.remove('d-none');

    convertBtn.disabled = false;
    showStatus('✅ Preview ready', 'success');
});

// CONVERT
convertBtn.addEventListener('click', async () => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = cleanHTML;

    tempDiv.style.cssText = `
        width:210mm;
        min-height:297mm;
        padding:25mm 20mm;
        background:white;
    `;

    const options = {
        margin: 0,
        filename: selectedFile.name.replace('.docx', '.pdf'),
        html2canvas: { scale: 3 },
        jsPDF: { unit: 'mm', format: 'a4' }
    };

    const worker = html2pdf().set(options).from(tempDiv);
    pdfBlob = await worker.output('blob');
    pdfFileName = selectedFile.name.replace('.docx', '.pdf');

    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = pdfFileName;
    a.click();
    URL.revokeObjectURL(url);

    showStatus('✅ PDF Downloaded', 'success');
});

// SHARE
shareBtn?.addEventListener('click', async () => {
    if (!pdfBlob) return;

    const file = new File([pdfBlob], pdfFileName, { type: 'application/pdf' });

    if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'PDF File' });
    }
});

function showStatus(msg, type) {
    statusEl.innerHTML = msg;
    statusEl.className = `mt-4 alert alert-${type}`;
    statusEl.classList.remove('d-none');
}