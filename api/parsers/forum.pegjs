{
    var validTags = {
        b: { //bold
            open: function() {
                return "<span style='font-weight:bold;'>";
            },
            close: function() {
                return "</span>";
            }
        },
        item: { //item link
            open: function(attributes, id) {
                return "<item-link itemid='"+ id +"'>";
            },
            close: function() {
                return "</item-link>";
            }
        },
    }

    function open(tagName, attributes, id) {
        if(!validTags[tagName]||!validTags[tagName].open) {
            return "";
        }
        return validTags[tagName].open(attributes, id);
    }

    function close(tagName) {
        if(!validTags[tagName]||!validTags[tagName].close) {
            return "";
        }
        return validTags[tagName].close();
    }

    function selfClose(tagName, attributes, id) {
        if(!validTags[tagName] || !validTags[tagName].open || !validTags[tagName].close) {
            return "";
        }
        return validTags[tagName].open(attributes, id) + validTags[tagName].close();
    }
}

document = d:(open_tag / close_tag / text / newline / invalidTag)* 
    {
        return "<comment-text>"+d.join("")+"</comment-text>";
    }

text = t:[^\n\r\[\]]+ //any legal characters, except brackets and newline chars
    {
        return t.join("");
    }

newline = ("\r\n" / "\n")
    {
        return "<br/>";
    }

property = t:[a-zA-Z0-9]+ //alphanumeric only, for tag properties
    {
        return t.join("")
    }

tagAttribute = "|" key:property "=" value:property 
	{
		return key+":"+value
    }

open_tag = "[" tag:validTagName id:(id)? attributes:tagAttribute* "]" { return open(tag, attributes, id); }
    / "[" tag:validTagName id:(id)? attributes:tagAttribute* "/]" { return selfClose(tag, attributes, id); }

close_tag = "[/" t:validTagName "]"
    {
        return close(t);
    }

id = "=" id:(number) {return id;}

invalidTag = t:("[" (!property / ![\\]) text*) {return t.join("")}
	/ t:( (!property "]") ) {return t.join("")}
    
number = n:[0-9]* { return n.join("") }


validTagName "valid tag name" = ("item" / "b" / "test")