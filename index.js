const { Client, GatewayIntentBits, EmbedBuilder, SlashCommandBuilder, REST, Routes, PermissionFlagsBits } = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers],
});

// قائمة الأوامر المضمونة (بدون أخطاء Validation)
const commands = [
    new SlashCommandBuilder().setName('help').setDescription('قائمة جميع الأوامر'),
    new SlashCommandBuilder().setName('clear').setDescription('مسح الرسائل').addIntegerOption(o => o.setName('n').setDescription('العدد').setRequired(true)),
    new SlashCommandBuilder().setName('lock').setDescription('قفل القناة'),
    new SlashCommandBuilder().setName('unlock').setDescription('فتح القناة'),
    new SlashCommandBuilder().setName('warn').setDescription('تحذير عضو').addUserOption(o => o.setName('u').setDescription('العضو').setRequired(true)).addStringOption(o => o.setName('r').setDescription('السبب').setRequired(true)),
    new SlashCommandBuilder().setName('mute').setDescription('إسكات مؤقت').addUserOption(o => o.setName('u').setDescription('العضو').setRequired(true)).addIntegerOption(o => o.setName('t').setDescription('بالدقائق').setRequired(true)),
    new SlashCommandBuilder().setName('kick').setDescription('طرد عضو').addUserOption(o => o.setName('u').setDescription('العضو').setRequired(true)),
    new SlashCommandBuilder().setName('ban').setDescription('باند نهائي').addUserOption(o => o.setName('u').setDescription('العضو').setRequired(true)),
    new SlashCommandBuilder().setName('bot').setDescription('معلومات البوت'),
    new SlashCommandBuilder().setName('server').setDescription('معلومات السيرفر'),
    new SlashCommandBuilder().setName('user').setDescription('معلوماتك الشخصية'),
    new SlashCommandBuilder().setName('avatar').setDescription('عرض الصورة').addUserOption(o => o.setName('u').setDescription('العضو')),
    new SlashCommandBuilder().setName('ping').setDescription('سرعة الاستجابة'),
    new SlashCommandBuilder().setName('hack').setDescription('مزحة الاختراق').addUserOption(o => o.setName('u').setDescription('العضو').setRequired(true)),
    new SlashCommandBuilder().setName('joke').setDescription('نكتة عشوائية'),
    new SlashCommandBuilder().setName('azkar').setDescription('أذكار المسلم'),
].map(c => c.toJSON());

client.once('ready', async () => {
    console.log(`✅ ${client.user.tag} Online!`);
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    try {
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
        console.log('Commands Loaded Successfully');
    } catch (e) { console.error(e); }
});

client.on('interactionCreate', async i => {
    if (!i.isChatInputCommand()) return;
    await i.reply({ content: `✅ جاري تنفيذ الأمر: **${i.commandName}**`, ephemeral: true });
});

client.login(process.env.TOKEN);
