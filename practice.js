function exportCSV(filename, data) {
    const csvString = convertToCSV(data);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

function convertToCSV(data) {
    const header = Object.keys(data[0]).join(',');
    const body = data.map(obj => Object.values(obj).join(',')).join('\n');
    return `${header}\n${body}`;
}

// Example usage:
const data = [
    { Name: 'John', Age: 30, City: 'New York' },
    { Name: 'Alice', Age: 25, City: 'Los Angeles' },
    { Name: 'Bob', Age: 35, City: 'Chicago' }
];
exportCSV('example.csv', data);
