# Sumary

Test date sample `data[0].time`

IF failed regex
THEN check format is 1904

IF date type is number
    IF is 1904
    THEN convert to 1900 and convert to ISO String

    ELSE subtract 25567 ms and convert to ISO String

ELSE (date is NOT a number)
    IF date is not a string
    THEN do nothing

    ELSE convert GMT Time String to ISO Time String
