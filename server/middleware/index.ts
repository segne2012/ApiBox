import {getName , getDate} from '../../js/typesOfMock';
import projectsObj from '../../js/urlFilesOption';

export default (to, from) => {
    // console.log(to.path, to.url, to.hash, to.params, to.query, to.baseUrl, to.fullPath, to.meta, to.method);
    // console.log(from.path, from.url, from.hash, from.params, from.query, from.baseUrl, from.fullPath, from.meta, from.method);
    // console.log(to);
    // console.log(getName(), "--------------")
    return new Promise((resolve , reject) => {
        setTimeout(() => {
            projectsObj.getAllProjects().then(data => {
                console.log(data)
                console.log(data.baseProject)
            })
            resolve( getName());
        }, 1000);
    });
}