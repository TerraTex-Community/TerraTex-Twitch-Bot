-- Lies das Timeobject aus, wann der Stream begonnen hat
-- Da getStreamStart Asyncron arbeitet geben wir noch eine funktion an, die danach ausgeführt wird (hier auch direkt definiert als anynome funktion)
Stream:getStreamStart(function (startDateObject)


    -- Wenn startDateObject nicht nil oder false ist, dann läuft der Stream
    if (startDateObject) then
        -- Frage das aktuelle JS-DateObject mit Hilfe der Utilities Klasse ab
        local actual = Utilities:getDate()

        -- Definieren einer Ausgabe Variable
        local output = "";

        -- Berechnung der Differenz zwischen Aktuellen Zeitpunkt und Startzeitpunkt in Sekunden
        local diffInSeconds = math.floor((actual:getTime() - startDateObject:getTime()) / 1000)

        -- Berechnung: Wie viele volle Stunden sind das?
        local hours = math.floor(diffInSeconds / 3600);

        -- Wenn eine oder mehr Stunden, dann gebe die Stunden mit aus
        if (hours > 1) then
            output = output .. hours .. " Stunden "
        elseif (hours == 1) then
            output = output .. hours .. " Stunde "
        end

        -- Berechnung des Rests in Sekunden
        local rest = diffInSeconds - (hours * 3600)

        -- Berechnung: Wie viele volle Minuten sind im Rest?
        local minutes = math.floor(rest / 60);

        -- Wenn eine oder mehr Minuten, dann gebe die Minuten mit aus
        -- Oder Wenn mehr als eine Stune gebe 0 Minuten aus
        if (minutes > 1) then
            output = output .. minutes .. " Minuten "
        elseif (minutes == 1) then
            output = output .. minutes .. " Minute "
        elseif (hours > 0) then
            output = output .. "0 Minuten "
        end

        -- Berechnung des Rests in Sekunden
        rest = rest - (minutes * 60);

        --Füge Anzahl Sekunden hinzu
        if (rest > 1 or rest == 0) then
            output = output .. rest .. " Sekunden"
        else
            output = output .. rest .. " Sekunde"
        end

        -- Ausgabe
        Chat:output("Der Stream läuft schon seit " .. output)
    else
        Chat:output("Der Stream ist zur Zeit offline.")
    end
end)
