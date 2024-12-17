//rad 132

//Detta objektet håller informationen om hur många vapen man senare får välja. Namnet överernsstämmer exakt med namnet som är i stringen på kortet i HTML
const maxGunsByCarry = {
    "Niko Bellic": Infinity,
    "Makarov": 3,
    "Captain Price": 3,
    "S1mple": 2,
    "Arthur Morgan": 3,
    "Lester": 1
};

//detta objeketet samlar in respektive val. Alltså när ett kort klickas adderas det valdas kortets attribut i variabeln. T.ex weight blir 125lbs
let selectedAttributes = {
    weight: null,
    fightingStyle: null,
    charisma: null,
    carry: null,
    guns: []
};


let selectedCard = null; //vid klick blir det klickade kortet "selectedCard" Detta hanterar bland annat att selectedCard inte ska gråmarkeras. Det skickas också till selectedEquipment när man trycker på next. Vid varje next så återställs dock selectedCard till null
let totalPrice = 0; //varje gång ett kort väljs och man klickar på next adderas cardets pris till totalPrice
let totalPriceEnd = 0; //detta är slutsumman efter man har valt antal dagar för bodyguarden. Alltså totalPrice * 24 * input: t.ex 2
let maxGuns = 6; //maxGuns är fördefinierat som 6 eftersom detta är max antal vapen man kan välja men denna ändras beroende på vilket kort man väljer i steg 4. t.ex s1mple. Då ändras maxGuns till 2
let totalDiscount = 0; //totalDiscount påverkar endast resultatet om antal valda granater är mer än 5. Om föregående stämmer är totalDiscount = totalGrenadePrice * 0.5
let totalGrenadePrice = 0; // reduce går igenom hela arrayn och acc adderar till det totala värdet. numberOfGrenades är en array som fylls på när jag anger hur många granater man vill ha i input. 

let selectedGuns = []; //Detta är en array som samlar de vapen man väjer på steg5. maxGuns som förutbestäms vid val av carry karaktär jämförs med längden på selectedGuns arrayn. 
let numberOfGrenades = []; //Anger man t.ex 10 granater input fylls arrayn med 10 värden. 
let totalGrenades;

function updateTotalPriceDisplay() {
    $('#totalPriceDisplay').text(`Hourly Rate: $${totalPrice.toLocaleString()}`); //Denna funktionen hämtar värdet från totalPrice och sedan ändrar på värdet i HTML strängen totalPriceDisplay
}
function finalTotalPriceDisplay() {
    const discountedTotal = totalPriceEnd - totalDiscount;
    $('#totalPriceDisplayEnd').text(`Total Price: $${discountedTotal.toLocaleString()}`); //Denna funktionen bestämmer att variabeln discountedTotal ska ska vara det totala priset - det totala discountvärdet vilket endast existerar om man väljer fler än 5 granater. Den uppdaterar sedan detslutgiltiga priset en gång till. Tillskillnad från funktionen över är detta slutpriset som visas på summary när man valt antal dagar för bodyguarden.  
}


function discount() {
    if (numberOfGrenades.length > 0) { //Denna if tillåter endast koden att köras om valda granater är mer än 0
        const totalGrenadePrice = numberOfGrenades.reduce((acc, grenade) => { //numberOfGrenades blir ett antal i en array. Metoden går över arrayn och adderas varje värde till variabeln totalGrenadePrice
            return acc + grenade.totalPrice; //acc returneras och totalPrice adderas vilket blir värdet för nästa iteration. 
        }, 0);
        if (numberOfGrenades.reduce((acc, grenade) => acc + grenade.count, 0) >= 5) { //Om antalet granar är mer eller lika med 5
            console.log(totalGrenades)
            totalDiscount = totalGrenadePrice * 0.5; //så ska en ny variabel skapas som tar det totala priset på granaterna och dividera det med 2
        } else { //om inte
            totalDiscount = 0; //då ska discount vara 0. Alltså om man valt 4 eller färre granater. 
        }
        $('.discount').text(`Discount: $${totalDiscount.toLocaleString()}`); // Uppdaterar discount visningen
    } else {
        totalDiscount = 0; // Ingen rabatt om inga granater är valda
        $('.discount').text(`Discount: $${totalDiscount.toLocaleString()}`); //Samma sak fast om värdet är 0 ska ingen rabatt ges
    }
}


//Trigger för när man klickar på "next"
$("#nextStep2").on("click", nextStep2) //Detta är en knapp. När man klickar på den triggas funktionen nextStep2
$("#nextStep3").on("click", nextStep3); //Detta är en knapp. När man klickar på den triggas funktionen nextStep3
$("#nextStep4").on("click", nextStep4);//Detta är en knapp. När man klickar på den triggas funktionen nextStep4
$("#nextStep5").on("click", nextStep5);//Detta är en knapp. När man klickar på den triggas funktionen nextStep5
$(".summary").on("click", summary); //Funktionen summary triggas
$(".completeOrder").on("click", completeOrderThankYou); //När man klickar på completeOrder kommer man till tacksidan. 

$("#daysOrdered").on("input", numberOfDaysBodyguard); //uppdatera pris när man angett antal dagar. När man angett triggas funktionen. 

$(".restart").on("click", restart); // Restart. Knappen laddar om sidan. 

// hantering för kort i alla steg. Document ser till att funktionen lyssnar efter klassen .card även om sidan har laddats in. Alltså att DOMen kan ha förändrats och den lyssnar ändå. Om man väljer ett kort som redan är valt ska "deselectEquipment funktionen kallas och vice versa."
$(document).on("click", ".card", function () {
    if (selectedCard === this) {
        deselectEquipment.call(this);
    } else {
        selectEquipment.call(this);
    }
});

//Denna funktionen behandlar först valda kort i steg5 då detta avser interaktiviteten för och begränsning av antal vapen beroende på vilken karaktär man väljer i steg 4. 
function selectEquipment() {
    const isStep5 = $(this).closest("#step5").length > 0; //Variabeln isStep5 är "om man är på steg5."

    if (isStep5) { //Om man är på step5 ska denna koden köras.
        const gunName = $(this).find("#titleGuns").text(); //gunName = det valda kortets titleGuns. Den letar efter namnet i klassen titleGuns
        const nades = $(this).find("#priceGranat").text(); //Den letar efter priset på grenades genom klassen priceGranat
        console.log(typeof nades)
        // Kontrollera om användaren har valt en granat
        if (nades && !selectedGuns.includes(nades)) { //om nades är valda och att den inte finns med i arrayn selectedGuns
            const grenadeCount = prompt("How many nades?"); //grenadeCount får ett värde av användaren som anger hur många granater hen vill ha. 
            const grenadePrice = parseInt(nades.replace(/[$,]/g, "")); //priset som hämtades i HTML omvandlas till en in och tar bort dollartecknet och adderar inget annat. 

            if (grenadeCount && !isNaN(grenadeCount)) { //om grenadeCount har ett värde och att det inte är en sträng/ inte (is not a number)
                let totalGrenadePrice = grenadePrice * parseInt(grenadeCount); //totalGrenadePrice blir priset på 1 granat * antalet som angavs av användaren. 

                // Kontrollera om användaren har valt fler än 5 granater för att ge rabatt
                if (parseInt(grenadeCount) >= 5) {
                    totalGrenadePrice *= 0.5;
                }
                discount(); //kallar på funktionen discount. som adderar till slutpriset i summary

                numberOfGrenades.push({ //det nya värdet i arrayn numberOfGrenades förflyttas till HTML elementet som fick varaibeln nades. 
                    name: nades,
                    count: parseInt(grenadeCount),
                    totalPrice: totalGrenadePrice
                });

                totalPrice += totalGrenadePrice; //priset på granaterna adderas på totalPrice
                discount(); //discount kallas om det var fler än 5 valda granater
                updateTotalPriceDisplay(); //Slutpriset funktionen kallas och displayar det nya priset. 

                // Skapa ett nytt kort för granater i selectedEquipment
                const grenadeCard = $(this).clone(); //en klon skapas av kortet "this" och läggs till i variabeln grenadeCard
                grenadeCard.find("#titleGuns").text(`${nades} (${grenadeCount})`); //letar upp klassen titelGuns i HTML och uppdaterar med antal
                grenadeCard.find(".price").text(`$${totalGrenadePrice.toLocaleString()}`); //totalpriset adderas till price i granatkortet
                grenadeCard.addClass("cardSelected").appendTo($(".selectedEquipment")); //kortet förflyttas till selectedEquipment vilket är där nere. 
            }
        } else {
            // går vidare till om man väljer något annat än en granat. 
            if (selectedGuns.includes(gunName)) { //Om valt vapen innehåller gunName vilket är variabeln på där man letar efter en klass med namn titleGuns. Om vapnet redan finns i arrayn ska det tas bort och totalPrice ska subbtraheras med priset på vapnet. 
                selectedGuns = selectedGuns.filter(gun => gun !== gunName);
                $(`.selectedEquipment .card:contains('${gunName}')`).remove(); //Om kortet redan fanns i arrayn ska det tas bort från SelectedEquipment. 
                const priceText = $(this).find(".price").text(); //Variabeln priceText blir priset på det valda kortet.
                const priceValue = parseInt(priceText.replace(/[$,]/g, "")); //priset omvandlas till integer.
                totalPrice -= priceValue; //Priset på kortet subbtraheras med det totala priset.
                updateTotalPriceDisplay(); //Totala priset uppdateras. Denna funktionen kallas. 
                $(this).removeClass("grayOut"); //CSS klassen grayOut tar bort från kortet och det går nu att välja igen. 
            } else {
                // Kontrollera om max antal vapen är uppnått
                if (selectedGuns.length >= maxGuns) { // om längden på arrayn försöker bli fler än maxGuns alertas man. maxGuns är fördefinierat. T.ex s1mple max 2. 
                    alert(`You can only select up to ${maxGuns} weapon(s) with ${selectedAttributes.carry}!`); //alert. max vapen med denna karaktären. 
                    //Alla andra kort får klassen grayOut eftersom det nu inte går att välja fler kort. 
                    return;
                }

                // Lägg till vapnet om det inte redan är valt
                selectedGuns.push(gunName); //arrayn selectedGuns får ett nytt värde: alltså titeln på vapnet. 
                const gunCard = $(this).clone(); //gunCard vapen kortet kopieras
                const priceText = $(this).find(".price").text(); //variabeln priceText får värdet som ligger i price klassen på vapenkortet. 
                const priceValue = parseInt(priceText.replace(/[$,]/g, "")); //Det hämtade "priset" omvandlas från sträng till int.
                totalPrice += priceValue; //Priset adderas på totalPrice
                updateTotalPriceDisplay(); //Slutpriset uppdateras i realtid. 
                gunCard.addClass("cardSelected").appendTo($(".selectedEquipment")); //gunCard får en ny klass och skickas till selectedEquipment. 
            }
        }
    } else {
        //andra steg (inte step5)
        if (selectedCard === this) {
            deselectEquipment.call(this);
        } else {
            selectedCard = this;
            const priceText = $(this).find(".price").text();
            const priceValue = parseInt(priceText.replace(/[$,]/g, ""));
            totalPrice += priceValue;
            updateTotalPriceDisplay();
            $(".card").not(this).not('.cardSelected').addClass("grayOut");
        }
    }
}


function deselectEquipment() { //jag är inte helt säker på att denna längre än nödvändig då detta definieras i selectEquipment funktionen. 
    if (selectedCard === this) { //funktionen hämtar som vanligt priset i det valda kortet, omvandlar det till int och subbtraherar det på det totala priset. Slutpriset uppdateras i realtid och alla kort blir av med klassen grayOut så att de går att välja igen. selectedCard återställs sedan till NULL.
        const priceText = $(this).find(".price").text();
        const priceValue = parseInt(priceText.replace(/[$,]/g, ""))
        totalPrice -= priceValue;
        updateTotalPriceDisplay();
        $(".card").removeClass("grayOut")
        selectedCard = null
    }
}

//Funktioner som utförs när man klickar på "next"
function nextStep2() {
    if (selectedCard) { //om det valda kortet.
        selectedAttributes.weight = $(selectedCard).find('#subtitleWeight').text(); //Denna arrayn skapas i syfte att kunna göra en sammanfattning senare i Summary. Det valda kortets vikt t.ex 125lbs adderas i arrayn selectedAttributes. 
        $(selectedCard).appendTo($(".selectedEquipment")); //det valda kortet läss till i selected Equipment
        $("#step1").hide() //step 1 döljs
        $("#step2").fadeIn() //step 2 visas
        $(this).hide() //kortet döljs
        $(".instructionsTitle").text("Choose your bodyguards fightingstyle") //Titeln i DOMen uppdateras till de nya instruktionerna för step2
        $(".card").removeClass("grayOut") //korten blir av med klassen grayOut så att de går att välja. 
        $('.selectedEquipment').removeClass('.card').addClass('cardSelected1'); //Det valda kortet blir av med klassen card och får en ny cardSelected. Detta var den stora utmaningen i projektet eftersom jag hade svårt att låta de valda korten behålla samma klass. När de hamnade i selectedEquipment tappade de alla sina värden vilket gjorde att det inte gick att hämta värdena i dom i efterhand. Därför fick all info som pris osv lagras i variabler innan man gick vidare till nästa steg. 
        $(selectedCard).addClass("cardSelected").removeClass("grayOut"); //grayOut tar bort från kortet i selectedEquipment för att det blir tydligare att det är val.t
        selectedCard = null; //Kortet blir av med sitt värde innan nästa steg körs. 
        $('#step2').css('display', 'flex'); //Alla step är dolda från början. Jag fick därför addera display flex i js. 

    }

}
function nextStep3() {
    if (selectedCard) {
        selectedAttributes.fightingStyle = $(selectedCard).find('#titleStyle').text();
        $(selectedCard).appendTo($(".selectedEquipment"));
        $("#step2").hide()
        $("#step3").fadeIn()
        $(this).hide()
        $(".instructionsTitle").text("Choose your bodyguards charisma")
        $(".card").removeClass("grayOut")
        $('.selectedEquipment').removeClass('.card')
        $(selectedCard).addClass("cardSelected").removeClass("grayOut");
        selectedCard = null;
        $('#step3').css('display', 'flex');
    }
}
function nextStep4() {
    if (selectedCard) {
        selectedAttributes.charisma = $(selectedCard).find('#titleCharisma').text();
        maxGuns = maxGunsByCarry[selectedAttributes.carry];
        $(selectedCard).appendTo($(".selectedEquipment"));
        $("#step3").hide()
        $("#step4").fadeIn()
        $(this).hide()
        $(".instructionsTitle").text("Choose your bodyguards carry capability")
        $(".card").removeClass("grayOut")
        $(selectedCard).addClass("cardSelected").removeClass("grayOut");
        selectedCard = null;
        $('#step4').css('display', 'flex');
    }
}

function nextStep5() {
    if (selectedCard) {
        selectedAttributes.carry = $(selectedCard).find('#titleCarry').text();
        maxGuns = maxGunsByCarry[selectedAttributes.carry] || 1;
        $(selectedCard).appendTo($(".selectedEquipment"));
        $("#step4").hide()
        $("#step5").fadeIn()
        $(this).hide()
        $(".instructionsTitle").html("Choose your bodyguards loadout. <span style='color: red;'>NOTE!</span> Max " + maxGuns + " Gun(s)"); ")";
        $(".card").removeClass("grayOut")
        $(selectedCard).addClass("cardSelected").removeClass("grayOut");
        selectedCard = null;
        $('#step5').css('display', 'flex');
    }
}

function summary() {
    if (selectedGuns.length > 0) {
        selectedAttributes.guns = selectedGuns.join(', ');
        $(".step5").hide();
        $(".instructionsTitle").text("Choose your bodyguards loadout (Max Guns: " + maxGuns + ")");
        $(".card").removeClass("grayOut");
        selectedCard = null;
        $('#step5').css('display', 'none');
        $('.container').css('display', 'none');
        $('.instructions').css('display', 'none');
        $(".selectedEquipmentTitle").text("Order Summary");
        $(".daysOrderedBox").fadeIn();
        discount();
        $(".summaryText").html(`
            <p>Your bodyguard weighs ${selectedAttributes.weight}, He fights like ${selectedAttributes.fightingStyle}, has a charisma like ${selectedAttributes.charisma}, and a carry capability like ${selectedAttributes.carry}. He will be equipped with: ${selectedAttributes.guns}. He will keep you safe for sure!</p>`);
        $(".summaryText").show();
        $(".completeOrderButton").show();
    } else {
        alert("Please select at least one weapon");
    }
}

//när man klickar på restart körs denna funktionen. Sidan laddas om. 
function restart() {
    location.reload();
}

function numberOfDaysBodyguard() { //I summary får man välja antalet dagar man ska ha sin bodyguard. 
    const daysOrdered = parseInt($("#daysOrdered").val()) || 0; //variabeln daysOrdered blir inputen från användaren. Fallback blir 0 men detta tillåts inte i i funktionen under. 
    const hourlyRate = totalPrice; //totala priset är hourlyraten. Detta är jag som varit dålig med variabelnnamnen då projektets funktioner inte definierades till 100% i början. 
    const dailyRate = hourlyRate * 24; //dailyRate blir totalpriset * 24. Alltså ett dyng. 
    totalPriceEnd = dailyRate * daysOrdered; //Det absolut slutgiltiga priset blir dailyRate * inputen /antal dagar användaren vill beställa bg
    finalTotalPriceDisplay(); //slutpriset uppdateras. 
}

function completeOrderThankYou() {
    //om valda dagar är mindre än 1 tvingas man välja minst 1 dag innan man kan klicka på completeOrder. När man har gjort det skickas man till en annan HTML sidan som säger tack för beställningen. 
    const daysOrdered = parseInt($("#daysOrdered").val()) || 0;
    if (daysOrdered < 1) {
        alert("You must order a bodyguard atleast 1 day")
        return;
    }
    window.location.href = "thankyou.html"
}

$(document).on("click", ".selectedEquipment .card", function () {
    if ($(this).closest('#step5').length > 0) {
        const gunName = $(this).find('#titleGuns').text();
        selectedGuns = selectedGuns.filter(gun => gun !== gunName);
        const priceText = $(this).find(".price").text();
        const priceValue = parseInt(priceText.replace(/[$,]/g, ""));
        totalPrice -= priceValue;
        updateTotalPriceDisplay();
        $(this).remove();
        $(`#step5 .card:contains('${gunName}')`).removeClass("grayOut");
    }
});