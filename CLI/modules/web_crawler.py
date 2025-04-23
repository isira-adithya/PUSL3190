import requests
from typing import List
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from datetime import datetime
from rich.console import Console
import validators
from rich.progress import Progress, TaskID
from typing import Optional, Set, Dict
from modules.html_parser import HTMLParser

class WebCrawler:
    def __init__(self, base_url: str, max_depth: int = 2, max_pages: int = 100, should_crawl: bool = False, proxy: str = None, insecure: bool = False, headers: List[str] = [], cookies: str = None):
        self.base_url = base_url
        self.max_depth = max_depth
        self.max_pages = max_pages
        self.visited_urls: Set[str] = set()
        self.results = []
        self.console = Console()
        self.progress: Optional[Progress] = None
        self.tasks: Dict[str, TaskID] = {}
        self.identified_forms = []
        self.should_crawl = should_crawl
        self.http_session = requests.Session()
        self.http_session.proxies.update({
            'http': proxy,
            'https': proxy
        })
        if insecure:
            requests.packages.urllib3.disable_warnings(requests.packages.urllib3.exceptions.InsecureRequestWarning)
        self.http_session.verify = not insecure
        self.http_session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
        })
        if len(headers) > 0:
            for header in headers:
                key, value = header.split(':', 1)
                # Validate header format
                if not key or not value:
                    raise ValueError(f"Invalid header format: {header}. Expected 'Key: Value'.")
                # Add header to session
                self.http_session.headers[key.strip()] = value.strip()
        if cookies:
            cookies = cookies.strip()
            c_key_pairs = cookies.split(';')
            for c_key_pair in c_key_pairs:
                ckey, cval = c_key_pair.split('=', 1)
                # Validate cookie format
                if not ckey or not cval:
                    raise ValueError(f"Invalid cookie format: {c_key_pair}. Expected 'Key=Value'.")
                # Add cookie to session
                self.http_session.cookies[ckey.strip()] = cval.strip()
        
    def is_valid_url(self, url: str) -> bool:
        """Check if URL is valid and belongs to the same domain."""
        # Do not crawl external links which are out of scope! 
        if not validators.url(url):
            return False
        return urlparse(url).netloc == urlparse(self.base_url).netloc
    
    def get_links(self, url: str) -> set:
        """Extract all links from a webpage."""
        try:
            response = self.http_session.get(url, timeout=10)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')
            links = set()
            
            for link in soup.find_all('a', href=True):
                href = link['href']
                absolute_url = urljoin(url, href)
                if self.is_valid_url(absolute_url):
                    links.add(absolute_url)
            
            return links
        except Exception as e:
            self.console.print(f"[red]Error processing {url}: {str(e)}[/red]")
            return set()
    
    def extract_page_info(self, url: str, response: requests.Response) -> dict:
        """Extract relevant information from a webpage."""
        soup = BeautifulSoup(response.text, 'html.parser')
        return {
            'url': url,
            'title': soup.title.string if soup.title else 'No title',
            'meta_description': soup.find('meta', {'name': 'description'})['content']
                if soup.find('meta', {'name': 'description'}) else 'No description',
            'headers': [h.text for h in soup.find_all(['h1', 'h2', 'h3'])],
            'status_code': response.status_code,
            'crawled_at': datetime.now().isoformat()
        }
    
    def crawl(self, url: str, depth: int = 0):
        """Recursively crawl the website starting from the given URL."""
        if (
            depth > self.max_depth or 
            url in self.visited_urls or 
            len(self.visited_urls) >= self.max_pages
        ):
            return
        
        self.visited_urls.add(url)
        
        try:
            # update progress for the console
            if self.progress:
                task_id = self.progress.add_task(
                    description=f"Crawling {url}", 
                    total=None,
                    visible=True
                )
                self.tasks[url] = task_id

            response = self.http_session.get(url, timeout=10)
            response.raise_for_status()

            # identify forms
            html_parser = HTMLParser(url, response.text)
            identified_forms = html_parser.extract_forms()
            self.identified_forms.extend(identified_forms)
            
            # extract page information
            page_info = self.extract_page_info(url, response)
            self.results.append(page_info)
            
            # mark as done in progress for the console
            if self.progress and url in self.tasks:
                self.progress.update(self.tasks[url], visible=False)
            
            # get links and keep crawling
            links = self.get_links(url)
            if (self.should_crawl):
                for link in links:
                    self.crawl(link, depth + 1)
                    
        except Exception as e:
            self.console.print(f"[red]Error crawling {url}: {str(e)}[/red]")
            if self.progress and url in self.tasks:
                self.progress.update(self.tasks[url], visible=False)
