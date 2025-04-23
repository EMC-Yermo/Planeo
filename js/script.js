// Tomamos la función jsPDF desde la variable global (CDN)
const { jsPDF } = window.jspdf;

document.addEventListener("DOMContentLoaded", () => {
  const mapContainer = document.getElementById("map-container");
  const dropArea = document.getElementById("drop-area");

  let draggedElem = null;
  let offsetX = 0;
  let offsetY = 0;

  // Todos los div.group se pueden arrastrar
  const groups = document.querySelectorAll(".group");
  groups.forEach((elem) => {
    elem.addEventListener("dragstart", (e) => {
      draggedElem = elem;
      // Calculamos la posición interna del cursor
      const rect = elem.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      // Transferencia de datos (opcional)
      e.dataTransfer.setData("text/plain", elem.innerText);
    });
  });

  // Permitimos soltar en #drop-area
  dropArea.addEventListener("dragover", (e) => {
    e.preventDefault();
  });

  // Al soltar uno de los elementos
  dropArea.addEventListener("drop", (e) => {
    e.preventDefault();
    if (draggedElem) {
      // Creamos un clon con la clase .placed
      const clone = draggedElem.cloneNode(true);
      clone.classList.add("placed");
      dropArea.appendChild(clone);

      // Calculamos posición absoluta
      const containerRect = dropArea.getBoundingClientRect();
      const newLeft = e.clientX - containerRect.left - offsetX;
      const newTop = e.clientY - containerRect.top - offsetY;

      // Asignamos pos. al clon
      clone.style.left = `${newLeft}px`;
      clone.style.top = `${newTop}px`;

      draggedElem = null;
    }
  });

  // Botones de exportación
  const btnPdf = document.getElementById("btn-pdf");
  const btnImg = document.getElementById("btn-img");

  // Exportar a PDF
  btnPdf.addEventListener("click", async () => {
    const canvas = await html2canvas(mapContainer);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "letter" });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("acomodo-viacrucis.pdf");
  });

  // Exportar a Imagen (PNG)
  btnImg.addEventListener("click", async () => {
    const canvas = await html2canvas(mapContainer);
    const imgData = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = imgData;
    link.download = "acomodo-viacrucis.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
});
