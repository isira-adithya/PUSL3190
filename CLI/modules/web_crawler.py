import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from datetime import datetime
from rich.console import Console
import validators
from rich.progress import Progress, TaskID
from typing import Optional, Set, Dict
from modules.html_parser import HTMLParser

class WebCrawler:
    def __init__(self, base_url: str, max_depth: int = 2, max_pages: int = 100):
        self.base_url = base_url
        self.max_depth = max_depth
        self.max_pages = max_pages
        self.visited_urls: Set[str] = set()
        self.results = []
        self.console = Console()
        self.progress: Optional[Progress] = None
        self.tasks: Dict[str, TaskID] = {}
        
    def is_valid_url(self, url: str) -> bool:
        """Check if URL is valid and belongs to the same domain."""
        if not validators.url(url):
            return False
        return urlparse(url).netloc == urlparse(self.base_url).netloc
    
    def get_links(self, url: str) -> set:
        """Extract all links from a webpage."""
        try:
            response = requests.get(url, timeout=10)
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
            # Update progress
            if self.progress:
                task_id = self.progress.add_task(
                    description=f"Crawling {url}", 
                    total=None,
                    visible=True
                )
                self.tasks[url] = task_id

            response = requests.get(url, timeout=10)
            response.raise_for_status()

            # Identify Forms
            html_parser = HTMLParser(url, response.text)
            identified_forms = html_parser.process()
            # print(identified_forms)
            
            # Extract and store page information
            page_info = self.extract_page_info(url, response)
            self.results.append(page_info)
            
            # Complete the task for this URL
            if self.progress and url in self.tasks:
                self.progress.update(self.tasks[url], visible=False)
            
            # Get links and continue crawling
            links = self.get_links(url)
            for link in links:
                self.crawl(link, depth + 1)
                    
        except Exception as e:
            self.console.print(f"[red]Error crawling {url}: {str(e)}[/red]")
            if self.progress and url in self.tasks:
                self.progress.update(self.tasks[url], visible=False)