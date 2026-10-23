---
title: Search admin products by EAN and manufacturer number
issue: #15828
---
# Elasticsearch
* Changed `Shopware\Elasticsearch\Admin\Indexer\ProductAdminSearchIndexer::globalCriteria` to add term queries on `ean`, `productNumber` and `manufacturerNumber`, so exact identifiers are found in the admin search when `ENABLE_OPENSEARCH_FOR_ADMIN_API` is active.
