-- Lies die bisherige Ausgabe aus dem Command Speicher aus
local text = Command:getData()

-- Lies alles nach dem Command als einen Parameter aus
local newText = Command.parameter

-- Wenn der Benutzer, der den Command gesendet hat Moderator ist
-- Und es einen neuen Text gibt
if User:isModerator() and string.len(newText) > 0 then
    -- Speichere den neuen Text in den Commandspeicher
    Command:setData(newText)
    -- Überschreibe die bisherige Ausgabe
    text = newText
end

-- Gebe den Text aus
Chat:output(text)

