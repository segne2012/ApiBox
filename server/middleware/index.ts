import {getName , getDate} from '../../js/typesOfMock';
import projectsObj from '../../js/urlFilesOption';

export default (to, from, next) => {
    // console.log(to.url);
    let method = to.method;

    let params = useQuery(to);

    switch (to.url) {
        case '/':
            // 
            $fetch('/project', {method, body: params});
            next();
            return;
            break;
        case '/project':
            next();
            break;
        
        default:
            return new Promise((resolve , reject) => {
                projectsObj.getAllProjects().then(data => {
                    console.log(data, '----name data----')
                })
                let name = getName()
                String(name)
                resolve( new String(name));
            });
            break;
    }
    // console.log(to.method)
    
}