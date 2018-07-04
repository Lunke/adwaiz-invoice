  (function(API){
    API.textAlign = function(txt, options, x, y) {
        options = options ||{};
        // Use the options align property to specify desired text alignment
        // Param x will be ignored if desired text alignment is 'center'.
        // Usage of options can easily extend the function to apply different text
        // styles and sizes

		// Get current font size
        var fontSize = this.internal.getFontSize();

        // Get page width
        var pageWidth = this.internal.pageSize.width;

        // Get the actual text's width
        // You multiply the unit width of your string by your font size and divide
        // by the internal scale factor. The division is necessary
        // for the case where you use units other than 'pt' in the constructor
        // of jsPDF.

        var txtWidth = this.getStringUnitWidth(txt)*fontSize/this.internal.scaleFactor;

        if( options.align === "center" ){

            // Calculate text's x coordinate
            x = ( pageWidth - txtWidth ) / 2;

        } else if( options.align === "centerAtX" ){ // center on X value

	        x = x - (txtWidth/2);

        } else if(options.align === "right") {

	        x = x - txtWidth;
        }

        // Draw text at x,y
        this.text(txt,x,y);
    };


    API.getLineHeight = function(txt) {
        return this.internal.getLineHeight();
    };

})(jsPDF.API);

var currentDate = new Date();  
$('#date').datepicker({dateFormat: 'dd.mm.yy', showButtonPanel: true, showAnim: 'slideDown'});
$("#date").datepicker("setDate", currentDate);

var pdf;
var y;

createPDF(true);

function createPDF(update) {
    pdf = new jsPDF('p', 'pt', 'a4');
    
    var preview_container = document.getElementById('pdf_preview');
    var name = document.getElementById('name');
    var address = document.getElementById('address');
    var phone = document.getElementById('phone');
    var email = document.getElementById('email');
    var invoice = document.getElementById('invoice');
    var date = document.getElementById('date');
    var projectInfo = document.getElementById('projectInfo');
    var projectContact = document.getElementById('projectContact');
    
    // MARGIN = 12.7 mm
    var leftMargin = 40;
    var rightMargin = 555;
    var defaultSpace = 12;
    var midX = 300;
    
    y = 60;
    
    pdf.setFontSize(20);	
    pdf.setFontType("bold");
    pdf.setTextColor(126, 126, 126);
    pdf.textAlign("INFLUENCER INVOICE", {align: "right"}, rightMargin, y);
    
    pdf.setFontSize(9);	
    pdf.setFontType("regular");
    pdf.setTextColor(0, 0, 0);
    y += 20;

    addText(name, "Enter name", leftMargin, defaultSpace);
    addText(address, "Enter address", leftMargin, defaultSpace);
    addText(phone, "Enter phone", leftMargin, defaultSpace);
    addText(email, "Enter email", leftMargin, defaultSpace);
    addText(invoice, "Enter invoice number", rightMargin, defaultSpace, "right", "Invoice #");
    addText(date, "Enter date", rightMargin, defaultSpace*2, "right", "Date: ");
    
    pdf.setFontType("bold");
    pdf.text("To:", leftMargin, y);
    pdf.text("Project info:", midX, y);
    y += defaultSpace;
    pdf.setFontType("regular");

    pdf.text("Adwaiz Limited\nMaddox House, Maddox Street 1\nW1S 2PZ, London\nUnited Kingdom\nmoney@adwaiz.com", leftMargin, y);
    
    var splitTitle = pdf.splitTextToSize(projectInfo.value == "" ? "Enter project info" : projectInfo.value, 250);
    if (projectInfo.value == "") {
        pdf.setTextColor(256, 0, 0);
        pdf.text(splitTitle, midX, y);
        pdf.setTextColor(0, 0, 0);
    } else {
        pdf.text(splitTitle, midX, y);
    }
    y += defaultSpace + (defaultSpace * splitTitle.length);
    
    pdf.setFontType("bold");
    pdf.text("Project contact:", midX, y); 
    y += defaultSpace;
    pdf.setFontType("regular");
    
    addText(projectContact, "Enter project contact", midX, 30);

    
    var columns = [
		{title: "DESCRIPTION", dataKey: "desc"},
		{title: "AMOUNT", dataKey: "amt"}
	];
    var rows = [];
    var totalAmt = 0;
    
    var table = document.getElementById('tbl');
    for (var r = 0, n = table.rows.length; r < n; r++) {
        if (table.rows[r].className == "hide") {
            continue;
        }
        var desc = "";
        var amt = "";
        
        for (var c = 0, m = table.rows[r].cells.length; c < m; c++) {
            var cell = table.rows[r].cells[c];
            if (cell.id == "data_desc") {
                desc = cell.innerText;
            } else if (cell.id == "data_amt") {
                amt += "£" + cell.innerText;
                totalAmt += parseInt(cell.innerText);
            }
        }
        if (desc != "" || amt != "") {
            rows.push({"desc": desc, "amt": amt});
        }
    }

    pdf.autoTable(columns, rows, {
        startY: y,
        theme: 'plain',
        styles: {
            overflow: 'linebreak',
            lineWidth: 1,
            lineColor: [100, 100, 100]
        },
        columnStyles: {
            amt: {
                columnWidth: 100,
                halign: 'right',
                cellPadding : 15,
            },
        },
        headerStyles: {
            fontSize: 10,
            fontStyle: 'bold',
            halign: 'center'
        }
    });
    
    var totalAmtTxt = "";
    if (isNaN(totalAmt)) {
        totalAmtTxt = "Invalid amounts";
    } else {
        totalAmtTxt = "£" + totalAmt;
    }
    
    y += pdf.autoTable.previous.height;
    pdf.setDrawColor(0, 0, 0);
    pdf.rect(rightMargin - 99.5, y + 0.5, 100, 30);
    pdf.textAlign(totalAmtTxt, {align: "right"}, rightMargin - 15, y + 17)
    
    y += 60;
    pdf.text("Total due in 30 days.", leftMargin, y);
    y += 30;
    pdf.text("Please pay to:", leftMargin, y);
    y += defaultSpace;
    addText(bankName, "Enter bank name", leftMargin, defaultSpace);
    addText(sortCode, "Enter sort code", leftMargin, defaultSpace);
    addText(accountNumber, "Enter account number", leftMargin, defaultSpace);
    
    y += 50;
    
    pdf.setFontType("bold");
    pdf.textAlign("THANK YOU FOR YOUR BUSINESS", {align: "center"}, 0, y);
    
    if (update) {
        preview_container.src = pdf.output('datauristring');
    } else {
        preview_container.src = pdf.output('datauristring');
        pdf.save('ADWAIZ_INVOICE.pdf')
    }
}

function addText(element, placeholder, x, yAdd, align, startText) {
    if (element.value == "") {
        pdf.setTextColor(256, 0, 0);
        pdf.textAlign(placeholder, {align: align}, x, y);
        pdf.setTextColor(0, 0, 0);
    } else {
        pdf.textAlign((startText == null ? "" : startText) + element.value, {align: align}, x, y);
    }
    y += yAdd;
}





var $TABLE = $('#table');

$('.table-add').click(function () {
  var $clone = $TABLE.find('tr.hide').clone(true).removeClass('hide table-line');
  $TABLE.find('table').append($clone);
});

$('.table-remove').click(function () {
  $(this).parents('tr').detach();
});

$(document).ready(function() {

  $('input').blur(function() {

    // check if the input has any value (if we've typed into it)
    if ($(this).val())
      $(this).addClass('used');
    else
      $(this).removeClass('used');
  });

});
