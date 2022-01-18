import { TargetOptions } from '@angular-builders/custom-webpack';

export default (targetOptions: TargetOptions, indexHtml: string) => {
  const i = indexHtml.indexOf('</body>');
  const config = `<p>Configuration: ${targetOptions.configuration}</p>`;
  return `${indexHtml.slice(0, i)}
            ${config}
            ${indexHtml.slice(i)}`;
};
