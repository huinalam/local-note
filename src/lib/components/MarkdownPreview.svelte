<script lang="ts">
  import { MarkdownService } from '../services/markdownService';

  export let content: string = '';

  const markdownService = new MarkdownService();

  $: htmlContent = content ? markdownService.parseMarkdown(content) : '';
</script>

<div 
  class="markdown-preview" 
  data-testid="markdown-preview"
>
  {#if htmlContent}
    {@html htmlContent}
  {/if}
</div>

<style>
  .markdown-preview {
    height: 100%;
    padding: var(--space-6);
    background: var(--color-bg-primary);
    border-radius: 0.5rem;
    overflow-y: auto;
    font-family: var(--font-family-sans);
    line-height: 1.75;
    color: var(--color-text-primary);
  }

  .markdown-preview :global(h1) {
    font-size: var(--font-size-3xl);
    font-weight: var(--font-weight-bold);
    margin-bottom: var(--space-4);
    color: var(--color-text-primary);
    border-bottom: 1px solid var(--color-border-primary);
    padding-bottom: var(--space-2);
  }

  .markdown-preview :global(h2) {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-semibold);
    margin-bottom: var(--space-3);
    margin-top: var(--space-6);
    color: var(--color-text-primary);
  }

  .markdown-preview :global(h3) {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-semibold);
    margin-bottom: var(--space-2);
    margin-top: var(--space-5);
    color: var(--color-text-primary);
  }

  .markdown-preview :global(p) {
    margin-bottom: var(--space-4);
    color: var(--color-text-secondary);
  }

  .markdown-preview :global(strong) {
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
  }

  .markdown-preview :global(em) {
    font-style: italic;
    color: var(--color-text-secondary);
  }

  .markdown-preview :global(code) {
    background: var(--color-bg-secondary);
    color: var(--color-accent);
    padding: 0.125rem 0.25rem;
    border-radius: 0.25rem;
    font-family: var(--font-family-mono);
    font-size: 0.875em;
  }

  .markdown-preview :global(pre) {
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border-primary);
    border-radius: 0.5rem;
    padding: var(--space-4);
    margin-bottom: var(--space-4);
    overflow-x: auto;
  }

  .markdown-preview :global(pre code) {
    background: transparent;
    padding: 0;
    color: var(--color-text-primary);
  }

  .markdown-preview :global(a) {
    color: var(--color-accent);
    text-decoration: none;
  }

  .markdown-preview :global(a:hover) {
    text-decoration: underline;
  }

  .markdown-preview :global(ul),
  .markdown-preview :global(ol) {
    margin-bottom: var(--space-4);
    padding-left: var(--space-6);
  }

  .markdown-preview :global(li) {
    margin-bottom: var(--space-1);
    color: var(--color-text-secondary);
  }

  .markdown-preview :global(blockquote) {
    border-left: 4px solid var(--color-accent);
    padding-left: var(--space-4);
    margin-bottom: var(--space-4);
    font-style: italic;
    color: var(--color-text-tertiary);
  }

  .markdown-preview :global(table) {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: var(--space-4);
  }

  .markdown-preview :global(th),
  .markdown-preview :global(td) {
    border: 1px solid var(--color-border-primary);
    padding: var(--space-2);
    text-align: left;
  }

  .markdown-preview :global(th) {
    background: var(--color-bg-secondary);
    font-weight: var(--font-weight-semibold);
  }
</style> 