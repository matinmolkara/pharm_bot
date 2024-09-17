import TelegramBot from "node-telegram-bot-api";
import XLSX from "xlsx";
import schedule from "node-schedule";

const token = process.env.TELEGRAM_BOT_TOKEN;

const bot = new TelegramBot(token, {
  polling: true,
});

// Extract
const workbook = XLSX.readFile("./customers.xlsx");
const sheetName = workbook.SheetNames[0];
const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

// Extract customer list (limit to 200 customers)
const customers = worksheet.slice(0, 3);

async function sendMessageToCustomer(customer) {
  try {
    const chatId = customer["Mobile Number"];
    const pharmacyName = customer["Pharmacy Name"];
    const founderName = customer["Founder Name"];

    // Create the personalized message
    const message = `جناب آقای/سرکار خانم ${founderName},\nمدیریت محترم ${pharmacyName}`;

    // Send the initial message with greeting
    await bot.sendMessage(chatId, message);

    // Send the media (videos, images) as an album
    const media = [
      {
        type: "photo",
        media:
          "https://drive.google.com/uc?export=view&id=1-27NO0--Px-y3XNaJ80MsfYn2r-QiQW3",
      },
      {
        type: "photo",
        media:
          "https://drive.google.com/uc?export=view&id=1-2j_9yOPXQ2CUUllgkZIXiA-Gigoh0qD",
      },
      {
        type: "video",
        media:
          "https://drive.google.com/uc?export=view&id=1-BZf-sZe-WFXRvVIy6485Kpakuky7YFm",
      },
    ];

    await bot.sendMediaGroup(chatId, media);

    // Send the interactive buttons
    const options = {
      reply_markup: {
        inline_keyboard: [
          [{ text: "با من تماس بگیرید", callback_data: "contact_me" }],
          [{ text: "تماس با شرکت", callback_data: "call_company" }],
          [{ text: "فعلا نیاز ندارم", callback_data: "no_need" }],
          [{ text: "نیاز به مشاوره دارم", callback_data: "need_advice" }],
        ],
      },
    };

    await bot.sendMessage(
      chatId,
      "لطفا یکی از گزینه های زیر را انتخاب کنید:",
      options
    );
  } catch (error) {
    console.error(`Error sending message to customer: ${error}`);
    return "Error fetching weather data. Please try again later.";
  }
}
bot.on("callback_query", (callbackQuery) => {
  const message = callbackQuery.message;
  const chatId = message.chat.id;
  const data = callbackQuery.data;

  if (data === "contact_me") {
    bot.sendMessage(chatId, "با تشکر! به زودی با شما تماس گرفته می شود.");
  } else if (data === "call_company") {
    bot.sendMessage(chatId, "شماره تماس شرکت: +123456789");
  } else if (data === "no_need") {
    bot.sendMessage(chatId, "با تشکر در صورت نیاز با ما تماس بگیرید");
  } else if (data === "need_advice") {
    bot.sendMessage(chatId, "با تشکر به زودی مشاوره صورت میگیرد");
  }
});

schedule.scheduleJob("30 21 * * *", function () {
  customers.forEach((customer) => {
    sendMessageToCustomer(customer);
  });
});
