const { jsPDF } = window.jspdf;

document.addEventListener("DOMContentLoaded", () => {
  const mapContainer = document.getElementById("map-container");
  const dropArea = document.getElementById("drop-area");
  const btnPdf = document.getElementById("btn-pdf");
  const btnImg = document.getElementById("btn-img");

  let draggedElem = null;
  let offsetX = 0;
  let offsetY = 0;

  // Habilitar arrastre
  const draggables = document.querySelectorAll(".group, .figure");
  draggables.forEach((elem) => {
    elem.addEventListener("dragstart", (e) => {
      draggedElem = elem;
      const rect = elem.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      e.dataTransfer.setData("text/plain", elem.textContent);
    });
  });

  dropArea.addEventListener("dragover", (e) => {
    e.preventDefault();
  });
  dropArea.addEventListener("drop", (e) => {
    e.preventDefault();
    if (draggedElem) {
      const clone = draggedElem.cloneNode(true);
      clone.classList.add("placed");
      dropArea.appendChild(clone);

      const containerRect = dropArea.getBoundingClientRect();
      const newLeft = e.clientX - containerRect.left - offsetX;
      const newTop = e.clientY - containerRect.top - offsetY;
      clone.style.left = `${newLeft}px`;
      clone.style.top = `${newTop}px`;

      draggedElem = null;
    }
  });

  // Helper: esperar
  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Exportar PDF sin sombras
  btnPdf.addEventListener("click", async () => {
    document.body.classList.add("noShadows");
    await wait(50);

    const canvas = await html2canvas(mapContainer, {
      scrollX: 0,         // Ignora desplazamiento en X
      scrollY: 0,         // Ignora desplazamiento en Y
      windowWidth: mapContainer.scrollWidth,
      windowHeight: mapContainer.scrollHeight
    });
    document.body.classList.remove("noShadows");

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "letter" });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("acomodo-canchas.pdf");
  });

  // Exportar Imagen sin sombras
  btnImg.addEventListener("click", async () => {
    document.body.classList.add("noShadows");
    await wait(50);

    const canvas = await html2canvas(mapContainer, {
      scrollX: 0,
      scrollY: 0,
      windowWidth: mapContainer.scrollWidth,
      windowHeight: mapContainer.scrollHeight
    });
    document.body.classList.remove("noShadows");

    const imgData = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = imgData;
    link.download = "acomodo-canchas.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
});
