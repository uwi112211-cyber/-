const { Client, GatewayIntentBits, EmbedBuilder, SlashCommandBuilder, REST, Routes, PermissionFlagsBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});

// مصفوفة الأوامر المصححة والمختصرة لضمان عدم حدوث Crash
const commands = [
    // إدارية
    new SlashCommandBuilder().setName('ban').setDescription('تبنيد عضو').addUserOption(o => o.setName('u').setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    new SlashCommandBuilder().setName('kick').setDescription('طرد عضو').addUserOption(o => o.setName('u').setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
    new SlashCommandBuilder().setName('clear').setDescription('مسح رسائل').addIntegerOption(o => o.setName('n').setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    new SlashCommandBuilder().setName('lock').setDescription('قفل الروم').setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    new SlashCommandBuilder().setName('unlock').setDescription('فتح الروم').setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    new SlashCommandBuilder().setName('mute').setDescription('إسكات').addUserOption(o => o.setName('u').setRequired(true)).addIntegerOption(o => o.setName('t').setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    new SlashCommandBuilder().setName('unmute').setDescription('فك إسكات').addUserOption(o => o.setName('u').setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    new SlashCommandBuilder().setName('warn').setDescription('تحذير').addUserOption(o => o.setName('u').setRequired(true)).addStringOption(o => o.setName('r').setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    new SlashCommandBuilder().setName('hide').setDescription('إخفاء الروم').setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    new SlashCommandBuilder().setName('show').setDescription('إظهار الروم').setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    
    // ترفيه وألعاب
    new SlashCommandBuilder().setName('8ball').setDescription('اسأل البوت').addStringOption(o => o.setName('q').setRequired(true)),
    new SlashCommandBuilder().setName('hack').setDescription('مزحة الهكر').addUserOption(o => o.setName('u').setRequired(true)),
    new SlashCommandBuilder().setName('love').setDescription('نسبة الحب').addUserOption(o => o.setName('u1').setRequired(true)).addUserOption(o => o.setName('u2')),
    new SlashCommandBuilder().setName('rps').setDescription('حجرة ورقة مقص').addStringOption(o => o.setName('c').setRequired(true).addChoices({name:'حجرة',value:'r'},{name:'ورقة',value:'p'},{name:'مقص',value:'s'})),
    new SlashCommandBuilder().setName('kill').setDescription('قتل وهمي').addUserOption(o => o.setName('u').setRequired(true)),
    new SlashCommandBuilder().setName('slap').setDescription('صفعة').addUserOption(o => o.setName('u').setRequired(true)),
    new SlashCommandBuilder().setName('joke').setDescription('نكتة'),
    new SlashCommandBuilder().setName('meme').setDescription('ميم'),
    new SlashCommandBuilder().setName('iq').setDescription('اختبار ذكاء وهمي'),
    new SlashCommandBuilder().setName('beauty').setDescription('نسبة الجمال'),

    // معلومات
    new SlashCommandBuilder().setName('bot').setDescription('معلومات البوت'),
    new SlashCommandBuilder().setName('server').setDescription('معلومات السيرفر'),
    new SlashCommandBuilder().setName('user').setDescription('معلوماتك'),
    new SlashCommandBuilder().setName('avatar').setDescription('صورتك'),
    new SlashCommandBuilder().setName('ping').setDescription('سرعة النت'),
    
    // إسلاميات
    new SlashCommandBuilder().setName('azkar').setDescription('أذكار عشوائية'),
    new SlashCommandBuilder().setName('quran').setDescription('آية عشوائية'),
].map(c => c.toJSON());

client.once('ready', async () => {
    console.log(`🔥 ${client.user.tag} جاهز!`);
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    try {
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
        console.log('✅ تم تسجيل الأوامر بنجاح!');
    } catch (e) { console.error('❌ فشل تسجيل الأوامر:', e); }
});

client.on('interactionCreate', async i => {
    if (!i.isChatInputCommand()) return;
    try {
        await i.reply({ content: `⚙️ جاري تنفيذ الأمر: **${i.commandName}**...`, ephemeral: true });
    } catch (e) { console.error(e); }
});

client.login(process.env.TOKEN);
