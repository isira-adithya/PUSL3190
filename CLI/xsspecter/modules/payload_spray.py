from modules.config import Config
import urllib.parse
import requests
from requests_toolbelt import MultipartEncoder

class PayloadSpray:
    def __init__(self, payload, target, http_session: requests.Session):
        self.payload = payload
        self.target = target
        self.http_session = http_session
    
    def send_multipart_form_data(self, url, data, files=None):
        fields = {}
        
        # normal fields
        for key, value in data.items():
            fields[key] = (None, value, 'text/plain')
        
        # files
        if files:
            for field_name, file_path in files.items():
                fields[field_name] = (file_path, self.payload, 'text/plain')
        
        # Create encoder
        encoder = MultipartEncoder(fields=fields)
        
        # Send the request
        response = self.http_session.post(
            url,
            data=encoder,
            headers={
                'Accept': '*/*',
                'Accept-Encoding': 'gzip, deflate',
                'Connection': 'keep-alive',
                'Content-Type': encoder.content_type
            }
        )
        
        return response

    def generate_query(self, data):
        config = Config()

        # for data.key generate data.key=data.value&data.key=data.value
        query = ''
        urlEncodedPayload = urllib.parse.quote_plus(self.payload)
        for key in data:
            # Ignore keys with csrf_token, session_id, cookie, token, etc.
            if key.lower() in config.IGNORE_KEYS:
                query += f'{key}={data[key]["value"]}&'
            # Check if the key type is a specific one, if so use suitable values
            elif (data[key].get('type') == 'email'):
                query += f'{key}={config.DEFAULT_EMAIL}&'
            elif (data[key].get('type') == 'url'):
                query += f'{key}={config.DEFAULT_NUMBER}&'
            elif (data[key].get('type') == 'number'):
                query += f'{key}={config.DEFAULT_NUMBER}&'
            elif (data[key].get('type') == 'tel'):
                query += f'{key}={config.DEFAULT_PHONE}&'
            else:
                # query += f'{key}={data[key]}&'
                query += f'{key}={urlEncodedPayload}&'
        return query[:-1]

    def run(self):
        if (self.target.get('method').lower() == 'get'):
            query = self.generate_query(self.target.get('data'))
            result = self.http_session.get(f"{self.target.get('url')}?{query}", headers={'User-Agent': self.payload})
            return result
        elif (self.target.get('method').lower() == 'post'):
            if self.target.get('content_type').lower() == 'application/x-www-form-urlencoded':
                query = self.generate_query(self.target.get('data'))
                result = self.http_session.post(self.target.get('url'), data=query, headers={'User-Agent': self.payload, 'Content-Type': self.target.get('content_type')})
                return result
            elif self.target.get('content_type').lower() == 'multipart/form-data':
                multipart_form_data = {}
                multipart_file_names = {}
                for key in self.target.get('data'):
                    if (self.target.get('data')[key].get('type') == 'file'):
                        multipart_file_names[key] = self.payload
                    else:
                        multipart_form_data[key] = self.payload
                results = self.send_multipart_form_data(self.target.get('url'), multipart_form_data, multipart_file_names)
                return results
            else:
                # TODO: Add a detailed error log here
                print(self.target)
        else:
            # TODO: Add a detailed error log here
            print(self.target)