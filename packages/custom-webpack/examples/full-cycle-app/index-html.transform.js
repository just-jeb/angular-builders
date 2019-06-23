module.exports = targetOptions => async indexHtml => {
    const i = indexHtml.indexOf('</body>');
    const config = `<p>Configuration: ${targetOptions.configuration}</p>`
    return `${indexHtml.slice(0,i)}
            ${config}
            ${indexHtml.slice(i)}`
}