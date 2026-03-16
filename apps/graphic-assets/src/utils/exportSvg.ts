/**
 * Serializes an SVG DOM element to a string and triggers a file download.
 * Ensures the SVG has the correct XML namespace before saving.
 */
export function downloadSvg(element: SVGSVGElement, filename: string): void {
    const serializer = new XMLSerializer();
    let svgStr = serializer.serializeToString(element);

    // Guarantee SVG namespace present
    if (!svgStr.includes('xmlns="http://www.w3.org/2000/svg"')) {
        svgStr = svgStr.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
    }

    // Prepend XML declaration for maximum compatibility
    const fullSvg = `<?xml version="1.0" encoding="UTF-8"?>\n${svgStr}`;

    const blob = new Blob([fullSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
}
