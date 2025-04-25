const { jsPDF } = window.jspdf;

document.addEventListener("DOMContentLoaded", () => {
  const mapContainer = document.getElementById("map-container");
  const dropArea = document.getElementById("drop-area");

  const textInput = document.getElementById("text-input");
  const btnAddText = document.getElementById("btn-add-text");
  const textsList = document.getElementById("texts-list");

  const btnPdf = document.getElementById("btn-pdf");
  const btnImg = document.getElementById("btn-img");

  let draggedElem = null;
  let offsetX = 0;
  let offsetY = 0;

  // Preparar dragstart
  function initDragEvents(el) {
    el.addEventListener("dragstart", (e) => {
      draggedElem = el;
      const rect = el.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      e.dataTransfer.setData("text/plain", el.textContent);
    });
  }

  // Arranque: preparar .group y .figure
  document.querySelectorAll(".group, .figure").forEach(initDragEvents);

  // Permitir soltar
  dropArea.addEventListener("dragover", (e) => {
    e.preventDefault();
  });

  dropArea.addEventListener("drop", (e) => {
    e.preventDefault();
    if (!draggedElem) return;

    const isFigure = draggedElem.classList.contains("figure");
    const isGroup = draggedElem.classList.contains("group");
    const isText = draggedElem.classList.contains("text-item");

    const containerRect = dropArea.getBoundingClientRect();
    const newLeft = e.clientX - containerRect.left - offsetX;
    const newTop = e.clientY - containerRect.top - offsetY;

    if (isFigure) {
      // Ver si ya está en el mapa:
      // Si NO está en el mapa => clonamos
      // Si SÍ está en el mapa => movemos
      if (draggedElem.classList.contains("placed")) {
        // Ya estaba en el mapa => mover
        draggedElem.style.left = `${newLeft}px`;
        draggedElem.style.top = `${newTop}px`;
      } else {
        // Viene del panel => clon
        const clone = draggedElem.cloneNode(true);
        clone.classList.add("placed");
        dropArea.appendChild(clone);
        clone.style.left = `${newLeft}px`;
        clone.style.top = `${newTop}px`;

        // Hacer arrastrable
        initDragEvents(clone);
      }
    } else if (isGroup || isText) {
      // Mover (ya sea panel->mapa O reubicar en mapa)
      // Si está en panel, se quita de su padre
      const parent = draggedElem.parentNode;
      if (parent) parent.removeChild(draggedElem);

      draggedElem.classList.add("placed");
      dropArea.appendChild(draggedElem);
      draggedElem.style.left = `${newLeft}px`;
      draggedElem.style.top = `${newTop}px`;

      // Dejarlo arrastrable
      initDragEvents(draggedElem);
    }
    draggedElem = null;
  });

  // Crear texto
  btnAddText.addEventListener("click", () => {
    const val = textInput.value.trim();
    if (!val) return;

    const div = document.createElement("div");
    div.classList.add("text-item");
    div.setAttribute("draggable", "true");
    div.textContent = val;

    textsList.appendChild(div);
    initDragEvents(div);
    textInput.value = "";
  });

  // Helper para esperar
  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Exportar a PDF
  btnPdf.addEventListener("click", async () => {
    document.body.classList.add("noShadows");
    await wait(50);

    domtoimage.toPng(mapContainer)
      .then((dataUrl) => {
        document.body.classList.remove("noShadows");
        const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "letter" });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const imgProps = pdf.getImageProperties(dataUrl);
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save("acomodo-canchas.pdf");
      })
      .catch((err) => {
        document.body.classList.remove("noShadows");
        console.error("Error generando PNG con dom-to-image:", err);
      });
  });

  // Exportar a Imagen
  btnImg.addEventListener("click", async () => {
    document.body.classList.add("noShadows");
    await wait(50);

    domtoimage.toPng(mapContainer)
      .then((dataUrl) => {
        document.body.classList.remove("noShadows");
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = "acomodo-canchas.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch((err) => {
        document.body.classList.remove("noShadows");
        console.error("Error generando PNG con dom-to-image:", err);
      });
  });
});
