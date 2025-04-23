// Importamos jsPDF desde la variable global
const { jsPDF } = window.jspdf;

/**
 * Manejo nativo de Drag & Drop sin instalar nada:
 * - "draggable" en cada .group
 * - Escuchamos "dragstart", "dragover", "drop" en contenedor "drop-area"
 */
document.addEventListener("DOMContentLoaded", () => {
  const dropArea = document.getElementById("drop-area");
  const groupsContainer = document.getElementById("groups-container");
  const mapContainer = document.getElementById("map-container");

  let draggedElem = null;
  let offsetX = 0;
  let offsetY = 0;

  // Todos los grupos tendrán dragstart
  const groups = document.querySelectorAll(".group");
  groups.forEach((elem) => {
    elem.addEventListener("dragstart", (e) => {
      draggedElem = elem;
      // Obtenemos la diferencia de coordenadas para soltar con precisión
      const rect = elem.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      // (Opcional) Transferencia de datos
      e.dataTransfer.setData("text/plain", elem.innerText);
    });
  });

  // Permitimos soltar en "dropArea"
  dropArea.addEventListener("dragover", (e) => {
    e.preventDefault();
  });

  // Cuando soltamos un grupo en la zona
  dropArea.addEventListener("drop", (e) => {
    e.preventDefault();
    if (draggedElem) {
      // Creamos un clon que se posiciona en la zona
      const clone = draggedElem.cloneNode(true);
      clone.classList.add("placed");
      dropArea.appendChild(clone);

      // Calculamos la posición dentro de drop-area
      const containerRect = dropArea.getBoundingClientRect();
      const newLeft = e.clientX - containerRect.left - offsetX;
      const newTop = e.clientY - containerRect.top - offsetY;

      clone.style.left = newLeft + "px";
      clone.style.top = newTop + "px";

      // Listo, ya quedó colocado
      draggedElem = null;
    }
  });

  /**
   * Exportar a PDF / Imagen con html2canvas + jsPDF
   */
  const btnPdf = document.getElementById("btn-pdf");
  const btnImg = document.getElementById("btn-img");

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
