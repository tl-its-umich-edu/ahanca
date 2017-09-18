# development notes


Unfortunately, DefiantJS won't work with Node.js at this time.  

* It appears in npm, but `require()` can't load it.
* Instead of using npm, installing it in the project directory
allows it to be loaded with `require()`, but it complains that `navigator` is undefined.
* Defining `navigator` (it's only used to get `userAgent`) gets past that error, but a
new error, that `Defiant` is not defined, appears.

JSPath installs with npm and the simple tests work.  However, it doesn't use standard XPath
or JSONPath (http://goessner.net/articles/JsonPath/).

I'd tried using the DefiantJS tester (http://defiantjs.com/) 
with some JSON similar to my mapping:

```json
[
   {
      "label": "bc",
      "letters": [
         "b",
         "c"
      ]
   },
   {
      "label": "abc",
      "letters": [
         "a",
         "b",
         "c"
      ]
   },
   {
      "label": "abcx",
      "letters": [
         "a",
         "b",
         "c"
      ]
   },
   {
      "label": "ac",
      "letters": [
         "a",
         "c"
      ]
   }
]
```

This XPath finds all objects that contain one of "a" or "b", but not both:

```txt
//*[(letters="b" and not(letters="a")) or (not(letters="b") and letters="a")]
```

I'd like to use a JSPath equivalent to find all terms that don't list two specs in the **same**
definition.  So far, I've tried:

```javascript
'.{(.mapping.specification == "' + specFrom + '") && (.mapping.specification == "' + specTo + '")}.term'
```

But it gives all terms that contain the two specs in **any** definition.


I run my program with:

```bash
./ahanca.js caliper-1p0 caliper-1p1
```

