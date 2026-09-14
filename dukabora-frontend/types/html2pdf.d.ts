declare module "html2pdf.js" {
  type Html2Pdf = (element: HTMLElement) => {
    set: (options: Record<string, unknown>) => {
      from: (source: HTMLElement) => {
        save: () => Promise<void>;
      };
    };
  };

  const html2pdf: Html2Pdf;
  export default html2pdf;
}