import {getName , getDate} from '../../js/typesOfMock';
import projectsObj from '../../js/urlFilesOption';

export default (to, from) => {
    console.log(to.url);
    console.log(useQuery(to));
    console.log(to.method)
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