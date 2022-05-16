import projects from "../../js/urlFilesOption";

export default (to, from) => {
    console.log("----in api ======");
    return new Promise((resolve, reject) => {
        projects.getAllProjects().then(data => {
            // console.log(data)
            console.log(data.baseProject)
            resolve(data)
        })
    });
}