--
-- Created by IntelliJ IDEA.
-- User: C5217649
-- Date: 01.04.2016
-- Time: 11:08
-- To change this template use File | Settings | File Templates.
--

do -- Create js.ipairs and js.pairs functions. attach as __pairs and __ipairs on JS userdata objects.
local _PROXY_MT = debug.getregistry()._PROXY_MT

-- Iterates from 0 to collection.length-1
local function js_inext(collection, i)
    i = i + 1
    if i >= collection.length then return nil end
    return i, collection[i]
end
function js.ipairs(collection)
    return js_inext, collection, -1
end
_PROXY_MT.__ipairs = js.ipairs

function js.pairs(ob)
    local keys = js.global.Object:getOwnPropertyNames(ob) -- Should this be Object.keys?
    local i = 0
    return function(ob, last)
        local k = keys[i]
        i = i + 1;
        return k, ob[k]
    end, ob, nil
end
_PROXY_MT.__pairs = js.pairs
end