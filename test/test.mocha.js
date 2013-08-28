describe('HTML Rendering', function() {
  testRenderedHtml(function render(template) {
    return template.getHtml();
  });
});

describe('Fragment Rendering', function() {
  testRenderedHtml(function render(template) {
    var fragment = template.getFragment();
    var div = document.createElement('div');
    div.appendChild(fragment);
    return div.innerHTML;
  });
});

function testRenderedHtml(render) {
  it('renders an empty div', function() {
    var template = new saddle.Element('div');
    var html = render(template);
    expect(html).to.eql('<div></div>');
  });

  it('renders a div with literal attributes', function() {
    var template = new saddle.Element('div', {
      id: new saddle.Attribute('page')
    , 'class': new saddle.Attribute('content fit')
    });
    var html = render(template);
    expect(html).to.eql('<div id="page" class="content fit"></div>');
  });

  it('renders a void element', function() {
    var template = new saddle.Element('input', {
      value: new saddle.Attribute('hello')
    }, null, true);
    var html = render(template);
    expect(html).to.eql('<input value="hello">');
  });

  it('renders a true boolean attribute', function() {
    var template = new saddle.Element('input', {
      type: new saddle.Attribute('radio')
    , checked: new saddle.Attribute(true)
    }, null, true);
    var html = render(template);
    // In the case of getFragment, true boolean attributes must set a value
    html = html.replace('checked="checked"', 'checked');
    expect(html).to.eql('<input type="radio" checked>');
  });

  it('renders a false boolean attribute', function() {
    var template = new saddle.Element('input', {
      type: new saddle.Attribute('radio')
    , checked: new saddle.Attribute(false)
    }, null, true);
    var html = render(template);
    expect(html).to.eql('<input type="radio">');
  });

  it('renders nested elements', function() {
    var template = new saddle.Element('div', null, [
      new saddle.Element('div', null, [
        new saddle.Element('span')
      , new saddle.Element('span')
      ])
    ]);
    var html = render(template);
    expect(html).to.eql('<div><div><span></span><span></span></div></div>');
  });

  it('renders a text node', function() {
    var template = new saddle.Text('Hi');
    var html = render(template);
    expect(html).to.eql('Hi');
  });

  it('renders text nodes in an element', function() {
    var template = new saddle.Element('div', null, [
      new saddle.Text('Hello,')
    , new saddle.Text(' world.')
    ]);
    var html = render(template);
    expect(html).to.eql('<div>Hello, world.</div>');
  });

  it('renders a comment', function() {
    var template = new saddle.Comment('Hi');
    var html = render(template);
    expect(html).to.eql('<!--Hi-->');
  });

  it('renders a template', function() {
    var template = new saddle.Template([
      new saddle.Comment('Hi')
    , new saddle.Element('div', null, [
        new saddle.Text('Ho')
      ])
    ]);
    var html = render(template);
    expect(html).to.eql('<!--Hi--><div>Ho</div>');
  });
}

describe('replaceBindings', function() {

  function renderAndReplace(template) {
    var fixture = document.getElementById('fixture');
    fixture.innerHTML = template.getHtml();
    var fragment = template.getFragment();
    saddle.replaceBindings(fragment, fixture);
    fixture.innerHTML = '';
  }

  it('traverses a simple, valid DOM tree', function() {
    var template = new saddle.Template([
      new saddle.Comment('Hi')
    , new saddle.Element('ul', null, [
        new saddle.Element('li', null, [
          new saddle.Text('Hi')
        ])
      ])
    ]);
    renderAndReplace(template);
  });

  it('traverses with comments in a table and select', function() {
    // IE fails to create comments in certain locations when parsing HTML
    var template = new saddle.Template([
      new saddle.Element('table', null, [
        new saddle.Comment('table comment')
      , new saddle.Element('tr', null, [
          new saddle.Element('td')
        ])
      ])
    , new saddle.Element('select', null, [
        new saddle.Comment('select comment start')
      , new saddle.Element('option')
      , new saddle.Comment('select comment inner')
      , new saddle.Element('option')
      , new saddle.Comment('select comment end')
      , new saddle.Comment('select comment end 2')
      ])
    ]);
    renderAndReplace(template);
  });
});
