import fs from 'fs';
export const waitFor = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function addArrayToFile(filePath, data) {
    const objectsArray = getFileArray(filePath);

    fs.readFile(filePath, 'utf8',(error, fileData) => {
        if (error) {
            console.error('Error reading', error);
            return;
        }

        let objectsArray = [];

        if (fileData) {
            try {
                objectsArray = JSON.parse(fileData);
            } catch (parseErr) {
                console.log('Error parse data');
                return;
            }
        }
        
        data.forEach(el => {
            objectsArray.push(el);
        });
    })
}

export async function getArrayFromFile(path)  {
    try {
        const fileData = fs.readFileSync(path, 'utf8');
        if (fileData) {
            try {
                return JSON.parse(fileData);
            } catch (parseErr) {
                console.log('Error parse data');
            }
        }
        return [];

    } catch(error) {
        console.error('Error reding file:', error);
    }
};

export async function writeArrayToFile(filePath, array) {
    try {
        if (Array.isArray(array) && array.length > 0) {
            return fs.writeFileSync(filePath, JSON.stringify(array));
        }
    } catch (error) {
        console.error('Error write file', error)
    }
}
