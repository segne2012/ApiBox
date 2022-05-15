class Mock {
    mock: any;
    constructor() {
        this.mock = {};
    };
    get(url: string, data: any) {
        this.mock[url] = data;
    }
    getMock(url: string) {
        return this.mock[url];
    }
}

let getDateByType = (type: string) => {
    let date = new Date();
    switch (type) {
        case 'year':

            break;
        case 'month':
    }

    return date;
}

export default {}