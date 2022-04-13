class ExcursionsAPI {
    loadData(url) {
        return fetch(url)
            .then(resp => {
                if (resp.ok) {
                    return resp.json();
                }
                return Promise.reject(resp);
            });
    }
    addData(data, url) {
        const options = {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        };
        return fetch(url, options)
            .then(resp => console.log(resp))
            .catch(err => console.error(err))
    }
    removeData(url, id) {
        const options = {
                method: 'DELETE'
            }
            return fetch(`${url}/${id}`, options)
                .then(resp => console.log(resp))
                .catch(err => console.error(err))
    }
    updateData(url, id, data) {
        const options = {
                    method: 'PUT',
                    body: JSON.stringify(data),
                    headers: {'Content-Type': 'application/json'}
                };
                return fetch(`${url}/${id}`, options)
                    .then(resp => console.log(resp))
                    .catch(err => console.log(err))
    }
}


export default ExcursionsAPI;