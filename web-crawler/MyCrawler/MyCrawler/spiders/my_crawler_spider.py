# -*- coding: utf-8 -*-
import scrapy
import csv
from MyCrawler.items import MycrawlerItem

class MyCrawlerSpiderSpider(scrapy.Spider):
    name = 'my_crawler_spider'
    allowed_domains = []
    urls = []
    #start_urls = ['https://www.kawasaki-motors.com/mc/lineup/']

    with open('../../input.csv', 'r', encoding='utf8') as f:
        reader = csv.DictReader(f)
        header = next(reader)
        for row in reader:
            urls.append(row)

    def start_requests(self):
        for url in self.urls:
            yield scrapy.Request(url=url['url'], callback=self.parse, meta={'category': url['id'] + '_' + url['maker']})

    def parse(self, response):
        item = MycrawlerItem()
        item['url'] = response.url
        item['title'] = response.css('title::text').extract()
        item['text'] = response.text
        item['category'] = response.meta['category']
        yield item
