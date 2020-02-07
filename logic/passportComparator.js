const comparePassport = async (recognizedData, sourceData) => {
    const { name, last_name, patronymic, series, number, issued_by, issue_date, department_code } = sourceData;
    recognizedData = recognizedData.toUpperCase();
    return {
        name: recognizedData.indexOf(name.toUpperCase()) >= 0,
        last_name: recognizedData.indexOf(last_name.toUpperCase()) >= 0,
        patronymic: recognizedData.indexOf(patronymic.toUpperCase()) >= 0,
        series: recognizedData.indexOf(series.toUpperCase()) >= 0,
        number: recognizedData.indexOf(number.toUpperCase()) >= 0,
        issued_by: recognizedData.indexOf(issued_by.toUpperCase()) >= 0,
        issue_date: recognizedData.indexOf(issue_date.toUpperCase()) >= 0,
        department_code: recognizedData.indexOf(department_code.toUpperCase()) >= 0
    }
};

module.exports = {
    comparePassport
};