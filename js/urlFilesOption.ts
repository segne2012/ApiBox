import fs from 'fs';
import path from 'path';

function getAllProjects(){

    // let thisPath = __dirname;
    const __dirname = path.resolve();
    return new Promise((resolve , reject) => {
        fs.readFile(__dirname+"/js/urlFiles/projects.json", "utf-8", (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(JSON.parse(data));
            }
        });
    });
}

export default {
    getAllProjects
}