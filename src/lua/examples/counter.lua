-- erhalte die letzte Summe
local sum = Command:getData()

-- Wenn bisher keine daten gesetzt sind, setze sie auf 0
if not tonumber(sum) then
    sum = 0
end

-- Erhöhe die Summe im 1
sum = sum + 1

-- speichere Summe
Command:setData(sum)

-- Gebe die Summe aus
Chat:output("Der Befehl wurde " .. sum .. " mal ausgeführt")