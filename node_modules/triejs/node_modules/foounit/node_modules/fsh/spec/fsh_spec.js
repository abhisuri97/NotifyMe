var foounit = require('foounit').globalize()
  , fsh = require('fsh')
  , pth = require('path');

var fixtures;

before(function (){
  fixtures = pth.join(__dirname, 'fixtures');
});

it('mixes in the fs functions', function (){
  expect(typeof fsh.realpath).to(equal, 'function');
});

describe('isFileSync', function (){
  describe('when the resource is a file', function (){
    it('returns true', function (){
      var file = pth.join(fixtures, 'dir/file.txt');
      expect(fsh.isFileSync(file)).to(beTrue);
    });
  });

  describe('when the resource is not a file', function (){
    it('returns false', function (){
      var dir = pth.join(fixtures, 'dir');
      expect(fsh.isDirectorySync(dir)).to(beTrue);
      expect(fsh.isFileSync(dir)).to(beFalse);
    });
  });
});

foounit.run();
