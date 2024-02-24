import yake
def get_keywords(text,keywords_size):
    
    texts = text

    kw_extractor = yake.KeywordExtractor()
    keywords = kw_extractor.extract_keywords(texts)
    
    language = "en"
    max_ngram_size = 3
    deduplication_threshold = 0.9
    deduplication_algo = 'seqm'
    windowSize = 1
    numOfKeywords = keywords_size

    custom_kw_extractor = yake.KeywordExtractor(
        lan=language,
        n=max_ngram_size,
        dedupLim=deduplication_threshold,
        dedupFunc=deduplication_algo,
        windowsSize=windowSize,
        top=numOfKeywords,
        features=None)
    keywords = custom_kw_extractor.extract_keywords(text)
    
    return keywords