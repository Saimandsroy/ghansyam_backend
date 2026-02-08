const PDFDocument = require('pdfkit');

/**
 * Generate Invoice PDF
 * 
 * @param {Object} invoiceData - Invoice data object
 * @param {Object} invoiceData.blogger - Blogger info (name, phone, email, country)
 * @param {Object} invoiceData.company - Company info (name, address, email)
 * @param {Object} invoiceData.invoice - Invoice details (number, date, paidDate, status)
 * @param {Array} invoiceData.items - Array of {link, orderId, amount}
 * @param {string} invoiceData.note - Optional note
 * @param {number} invoiceData.total - Total amount
 * @returns {Promise<Buffer>} PDF buffer
 */
async function generateInvoicePdf(invoiceData) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50, size: 'A4' });
            const buffers = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', reject);

            const {
                blogger = {},
                company = {
                    name: 'Rankmeup Services',
                    address: '3rd floor, SCO 105, B - Block, Ranjit Avenue, Amritsar, Punjab 143001',
                    email: 'contact@linkmanagement.net'
                },
                invoice = {},
                items = [],
                note = '',
                total = 0
            } = invoiceData;

            // Colors
            const primaryColor = '#000000';
            const secondaryColor = '#666666';
            const greenColor = '#22C55E';

            // =============== HEADER ===============
            // Bill From (Left side)
            doc.fontSize(14).fillColor(primaryColor).font('Helvetica-Bold')
                .text('Bill From:', 50, 50);

            doc.fontSize(10).font('Helvetica')
                .text(blogger.name || 'N/A', 50, 70)
                .text(`Phone: ${blogger.phone || 'N/A'}`, 50, 85)
                .text(`Email: ${blogger.email || 'N/A'}`, 50, 100)
                .text(`Address: ${blogger.country || 'N/A'}`, 50, 115);

            // INVOICE title (Right side)
            doc.fontSize(28).font('Helvetica-Bold').fillColor(primaryColor)
                .text('INVOICE', 400, 50, { width: 150, align: 'right' });

            // Status badge
            const statusText = invoice.status === 1 ? 'Paid' : 'Pending';
            const statusColor = invoice.status === 1 ? greenColor : '#F59E0B';

            doc.fontSize(12).font('Helvetica-Bold').fillColor('#FFFFFF');
            doc.rect(450, 85, 80, 22).fill(statusColor);
            doc.fillColor('#FFFFFF').text(statusText, 450, 90, { width: 80, align: 'center' });

            // Invoice details
            doc.fontSize(10).font('Helvetica').fillColor(primaryColor);
            doc.text(`Invoice #: LM ${invoice.number || '00000'}`, 400, 115, { width: 150, align: 'right' });
            doc.text(`Invoice date: ${invoice.date || 'N/A'}`, 400, 130, { width: 150, align: 'right' });
            if (invoice.paidDate) {
                doc.text(`Paid date: ${invoice.paidDate}`, 400, 145, { width: 150, align: 'right' });
            }

            // =============== BILL TO ===============
            doc.moveTo(50, 160).lineTo(550, 160).stroke('#EEEEEE');

            doc.fontSize(14).font('Helvetica-Bold').fillColor(primaryColor)
                .text('Bill To:', 50, 175);

            doc.fontSize(10).font('Helvetica')
                .text(`Company Name: ${company.name}`, 50, 195)
                .text(`Address: ${company.address}`, 50, 210)
                .text(`Email: ${company.email}`, 50, 225);

            // =============== ITEMS TABLE ===============
            const tableTop = 260;
            const tableLeft = 50;
            const colWidths = { link: 300, orderId: 120, amount: 80 };

            // Table header
            doc.rect(tableLeft, tableTop, 500, 25).fill('#F5F5F5');
            doc.fontSize(10).font('Helvetica-Bold').fillColor(primaryColor);
            doc.text('Link', tableLeft + 10, tableTop + 8);
            doc.text('Order Id', tableLeft + colWidths.link + 10, tableTop + 8);
            doc.text('Amount', tableLeft + colWidths.link + colWidths.orderId + 10, tableTop + 8);

            // Table rows
            let currentY = tableTop + 25;
            doc.font('Helvetica').fontSize(9);

            items.forEach((item, index) => {
                // Draw row border
                doc.moveTo(tableLeft, currentY).lineTo(tableLeft + 500, currentY).stroke('#EEEEEE');

                // Check if we need a new page
                if (currentY > 700) {
                    doc.addPage();
                    currentY = 50;
                }

                // Link (truncate if too long)
                const linkText = item.link || 'N/A';
                const truncatedLink = linkText.length > 60 ? linkText.substring(0, 57) + '...' : linkText;

                doc.fillColor('#0066CC').text(truncatedLink, tableLeft + 10, currentY + 8, {
                    width: colWidths.link - 20,
                    lineBreak: false
                });

                doc.fillColor(primaryColor)
                    .text(item.orderId || 'N/A', tableLeft + colWidths.link + 10, currentY + 8)
                    .text(item.amount || '0', tableLeft + colWidths.link + colWidths.orderId + 10, currentY + 8);

                currentY += 30;
            });

            // Draw final row border
            doc.moveTo(tableLeft, currentY).lineTo(tableLeft + 500, currentY).stroke('#EEEEEE');

            // Total row
            currentY += 5;
            doc.font('Helvetica-Bold').fontSize(10);
            doc.text('Total', tableLeft + colWidths.link + colWidths.orderId - 30, currentY + 8);
            doc.text(String(total), tableLeft + colWidths.link + colWidths.orderId + 10, currentY + 8);

            // =============== NOTE ===============
            if (note) {
                currentY += 40;
                doc.font('Helvetica-Bold').fontSize(10).fillColor(primaryColor)
                    .text('Note:', tableLeft, currentY);
                doc.font('Helvetica').fontSize(9).fillColor(secondaryColor)
                    .text(note, tableLeft, currentY + 15, { width: 400 });
            }

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = { generateInvoicePdf };
