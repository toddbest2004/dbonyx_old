{
    var openListText = false;
    var validTags = {
        b: { //bold
            open: function() {
                return "<strong>";
            },
            close: function() {
                return "</strong>";
            }
        },
        bk: {
            open: function() {
                return "FOOOOO"
            },
            close: function() {
                return "/FOOOO"
            }
        },
        i: { //italics
            open: function() {
                return "<em>";
            },
            close: function() {
                return "</em>";
            }
        },
        s: {
            open: function() {
                return "<del>";
            },
            close: function() {
                return "</del>";
            }
        },
        u: {
            open: function() {
                return "<u>";
            },
            close: function() {
                return "</u>";
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
        list: {
            open: function() {
                return "<ul>";
            },
            close: function() {
                openListText = false;
                return "</ul>";
            }
        },
        "*": {
            open: function() {
                if(openListText){
                    return "</li><li>";
                } else {
                    openListText = true;
                    return "<li>";
                }
            },
            close: function() {
                openListText = false;
                return "</li>";
            }
        }
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
        return open(tagName, attributes, id) + close(tagName);
    }
}


document = d:comment* {
    return "<comment-text>"+d+"</comment-text>";
}

comment = d:(open_tag / close_tag / text / newline / invalidTag)+ {
    return d.join("");
}

text = t:[^\n\r\[\]]+ //any legal characters, except brackets and newline chars
    {
        return t.join("");
    }

newline = ("\r\n" / "\n")
    {
        return "<br/>";
    }
whitespace = [\s\n\r\t]+

property = t:[a-zA-Z0-9]+ //alphanumeric only, for tag properties
    {
        return t.join("")
    }

tagAttribute = "|" key:property "=" value:property 
	{
		return key+":"+value
    }

open_tag = "[" tag:validTagName text? id:(id)? attributes:tagAttribute* "]" ("\r\n" / "\n")? { return open(tag, attributes, id); }
    / "[" tag:validTagName id:(id)? attributes:tagAttribute* "/]" ("\r\n" / "\n")? { return selfClose(tag, attributes, id); }

close_tag = "[/" t:validTagName "]" ("\r\n" / "\n")? {
    return close(t);
}

id = "=" id:(number) {return id;}

number = n:[0-9]* { return n.join("") }

//list = "[list]" contents:(whitespace / listLine)* "[/list]" ("\r\n" / "\n")? {return "<ul>"+contents.join("")+"</ul>"}
//listLine = "[*]" contents:(comment)* "[/*]"? {return "<li>"+contents.join("")+"</li>";}


//ALWAYS longer or more specific tags first
// "item" before "i"
validTagName "valid tag name" = ("item" / "b" / "i" / "s" / "u" / "list" / "*")


invalidTag = "[" (!validTagName) {return "[";}
    / (!validTagName) "]" {return "]";}
