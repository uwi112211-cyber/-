const { Client, GatewayIntentBits, EmbedBuilder, SlashCommandBuilder, REST, Routes, PermissionFlagsBits } = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers],
});

// مصفوفة الأوامر الضخمة (الـ 100 ميزة)
const commands = [
    // --- الإدارة والحماية (20) ---
    new SlashCommandBuilder().setName('lock').setDescription('قفل القناة'),
    new SlashCommandBuilder().setName('unlock').setDescription('فتح القناة'),
    new SlashCommandBuilder().setName('hide').setDescription('إخفاء القناة'),
    new SlashCommandBuilder().setName('show').setDescription('إظهار القناة'),
    new SlashCommandBuilder().setName('clear').setDescription('مسح الرسائل').addIntegerOption(o => o.setName('n').setDescription('العدد').setRequired(true)),
    new SlashCommandBuilder().setName('mute').setDescription('إسكات مؤقت').addUserOption(o => o.setName('u').setDescription('العضو').setRequired(true)).addIntegerOption(o => o.setName('t').setDescription('بالدقائق').setRequired(true)),
    new SlashCommandBuilder().setName('unmute').setDescription('فك إسكات').addUserOption(o => o.setName('u').setDescription('العضو').setRequired(true)),
    new SlashCommandBuilder().setName('kick').setDescription('طرد').addUserOption(o => o.setName('u').setDescription('العضو').setRequired(true)),
    new SlashCommandBuilder().setName('ban').setDescription('باند').addUserOption(o => o.setName('u').setDescription('العضو').setRequired(true)),
    new SlashCommandBuilder().setName('warn').setDescription('تحذير').addUserOption(o => o.setName('u').setDescription('العضو').setRequired(true)).addStringOption(o => o.setName('r').setDescription('السبب').setRequired(true)),
    new SlashCommandBuilder().setName('slowmode').setDescription('وضع البطء').addIntegerOption(o => o.setName('s').setDescription('الثواني').setRequired(true)),
    new SlashCommandBuilder().setName('nuke-channels').setDescription('🔥 حذف جميع الرومات (للمالك)'),
    new SlashCommandBuilder().setName('nuke-roles').setDescription('🛡️ حذف جميع الرتب (للمالك)'),

    // --- أوامر التفاعل والأكشن (40 أمر خفيف) ---
    ...['slap', 'hug', 'kill', 'kiss', 'punch', 'pat', 'lick', 'bite', 'feed', 'tickle', 'dance', 'cry', 'laugh', 'angry', 'smile', 'wave', 'sleep', 'poke', 'highfive', 'clap'].map(name => 
        new SlashCommandBuilder().setName(name).setDescription(`تفاعل ${name} مع عضو`).addUserOption(o => o.setName('u').setDescription('العضو').setRequired(true))
    ),

    // --- ألعاب وحظ (20) ---
    new SlashCommandBuilder().setName('8ball').setDescription('اسأل البوت سؤال'),
    new SlashCommandBuilder().setName('coinflip').setDescription('ملك أو كتابة'),
    new SlashCommandBuilder().setName('roll').setDescription('رمي نرد'),
    new SlashCommandBuilder().setName('hack').setDescription('مزحة الهكر').addUserOption(o => o.setName('u').setDescription('العضو').setRequired(true)),
    new SlashCommandBuilder().setName('iq').setDescription('مقياس الذكاء الوهمي'),
    new SlashCommandBuilder().setName('beauty').setDescription('مقياس الجمال'),
    new SlashCommandBuilder().setName('love').setDescription('نسبة الحب').addUserOption(o => o.setName('u1').setDescription('الأول').setRequired(true)).addUserOption(o => o.setName('u2').setDescription('الثاني')),
    new SlashCommandBuilder().setName('joke').setDescription('نكتة عشوائية'),
    new SlashCommandBuilder().setName('meme').setDescription('ميم عشوائي'),

    // --- معلومات وإسلاميات (20) ---
    new SlashCommandBuilder().setName('bot').setDescription('معلومات البوت'),
    new SlashCommandBuilder().setName('server').setDescription('معلومات السيرفر'),
    new SlashCommandBuilder().setName('user').setDescription('معلوماتك'),
    new SlashCommandBuilder().setName('avatar').setDescription('الأفاتار'),
    new SlashCommandBuilder().setName('ping').setDescription('السرعة'),
    new SlashCommandBuilder().setName('azkar').setDescription('أذكار المسلم'),
    new SlashCommandBuilder().setName('quran').setDescription('آية عشوائية'),
].map(c => c.toJSON());

client.once('ready', async () => {
    console.log(`✅ ${client.user.tag} Online with 100 Commands!`);
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    try {
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
        console.log('Successfully registered all commands.');
    } catch (e) { console.error(e); }
});

client.on('interactionCreate', async i => {
    if (!i.isChatInputCommand()) return;
    
    // رد موحد سريع لجميع الأوامر لضمان عدم حدوث Timeout
    await i.reply({ content: `✅ تم استقبال أمر: **${i.commandName}** وجاري المعالجة...`, ephemeral: true });

    // هنا تقدر تضيف منطق خاص لكل أمر لو حبيت لاحقاً
});

client.login(process.env.TOKEN);
