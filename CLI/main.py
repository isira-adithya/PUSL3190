import typer
from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn, TaskID
import validators
from pathlib import Path
from modules.web_crawler import WebCrawler
from modules.result_exporter import ResultExporter


app = typer.Typer(help="Blind XSS Payload Sender CLI")

@app.command()
def crawl(
    url: str = typer.Argument(..., help="The starting URL to crawl"),
    depth: int = typer.Option(2, help="Maximum crawling depth"),
    max_pages: int = typer.Option(100, help="Maximum number of pages to crawl"),
    output: Path = typer.Option(
        "crawler_results.json",
        help="Output file path for the crawling results"
    )
):
    """
    Crawl a website starting from the given URL and save the results to a JSON file.
    """
    console = Console()
    
    if not validators.url(url):
        console.print("[red]Invalid URL provided. Please enter a valid URL.[/red]")
        raise typer.Exit(1)
    
    console.print(f"[green]Starting crawler with the following configuration:[/green]")
    console.print(f"URL: {url}")
    console.print(f"Max Depth: {depth}")
    console.print(f"Max Pages: {max_pages}")
    console.print(f"Output File: {output}")
    
    crawler = WebCrawler(url, depth, max_pages)
    
    # Create a single progress instance for the entire crawling process
    progress = Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        BarColumn(),
        console=console
    )
    
    with progress:
        crawler.progress = progress  # Assign the progress instance to the crawler
        crawler.crawl(url)
        
    console.print(f"\n[green]Crawling completed! Found {len(crawler.results)} pages.[/green]")
    
    # Export results
    ResultExporter.export_json(crawler.results, output)
    console.print(f"[green]Results exported to {output}[/green]")

if __name__ == "__main__":
    app()