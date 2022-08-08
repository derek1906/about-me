# about-me

Static site. To build locally, run:

```shell
bundle exec jekyll serve
```

The output will be placed in `/_site`.

## Requirements

- Ruby
- RubyGems
- Bundler
- Jekyll CLI

To install the required dependencies, run:

```shell
bundle install
```

## Directory structure

- `_data`: Structured data. Backs various pages.
- `_includes`: Common HTML fragments.
- `_layouts`: Core [layouts] shared by various pages.
- `_pages`: A [collection] of pages. These pages by default use the `page` layout.
- `assets`: Static assets including stylesheets and images.
- `snippets`: Interactive pages.

[layouts]: https://jekyllrb.com/docs/layouts/
[collection]: https://jekyllrb.com/docs/collections/