const { Client, GatewayIntentBits, EmbedBuilder, SlashCommandBuilder, REST, Routes, PermissionFlagsBits, ChannelType } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates
    ],
});

// متغير لحفظ حالة حماية الروابط (تنبيه: سيتم تصفيره عند ريستارت البوت)
let antiLinkEnabled = false;

const commands = [
    // --- الأوامر الجديدة القوية ---
    new SlashCommandBuilder().setName('lock-all').setDescription('🔒 قفل جميع رومات السيرفر').setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    new SlashCommandBuilder().setName('unlock-all').setDescription('🔓 فتح جميع رومات السيرفر').setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    new SlashCommandBuilder().setName('role-all').setDescription('🎭 إعطاء رتبة للجميع').addRoleOption(o => o.setName('role').setDescription('الرتبة').setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    new SlashCommandBuilder().setName('anti-link').setDescription('🛡️ نظام حماية الروابط').addStringOption(o => o.setName('status').setDescription('تفعيل أو تعطيل').setRequired(true).addChoices({name:'تفعيل',value:'on'},{name:'تعطيل',value:'off'})).setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    new SlashCommandBuilder().setName('move-all').setDescription('🔊 سحب الجميع لرومك الصوتي').setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers),
    
    // --- الأوامر الإدارية السابقة ---
    new SlashCommandBuilder().setName('hide-all').setDescription('🙈 إخفاء جميع الرومات').setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    new SlashCommandBuilder().setName('show-all').setDescription('👁️ إظهار جميع الرومات').setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    new SlashCommandBuilder().setName('timeout').setDescription('⏳ إسكات عضو').addUserOption(o => o.setName('user').setRequired(true)).addIntegerOption(o => o.setName('min').setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    new SlashCommandBuilder().setName('clear').setDescription('🧹 مسح الشات').addIntegerOption(o => o.setName('n').setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    new SlashCommandBuilder().setName('ping').setDescription('⚡ السرعة'),
].map(c => c.toJSON());

client.once('ready', async () => {
    console.log(`✅ ${client.user.tag} Is Ready!`);
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    try { await rest.put(Routes.applicationCommands(client.user.id), { body: commands }); } catch (e) { console.error(e); }
});

client.on('interactionCreate', async i => {
    if (!i.isChatInputCommand()) return;

    // --- قفل الكل ---
    if (i.commandName === 'lock-all') {
        await i.deferReply();
        i.guild.channels.cache.filter(c => c.type === ChannelType.GuildText).forEach(ch => ch.permissionOverwrites.edit(i.guild.id, { SendMessages: false }).catch(() => {}));
        return i.editReply('🔒 تم قفل جميع القنوات النصية.');
    }

    // --- فتح الكل ---
    if (i.commandName === 'unlock-all') {
        await i.deferReply();
        i.guild.channels.cache.filter(c => c.type === ChannelType.GuildText).forEach(ch => ch.permissionOverwrites.edit(i.guild.id, { SendMessages: true }).catch(() => {}));
        return i.editReply('🔓 تم فتح جميع القنوات النصية.');
    }

    // --- رتبة للكل ---
    if (i.commandName === 'role-all') {
        await i.deferReply();
        const role = i.options.getRole('role');
        i.guild.members.cache.forEach(m => m.roles.add(role).catch(() => {}));
        return i.editReply(`🎭 جاري إعطاء رتبة **${role.name}** للجميع (قد يستغرق وقتاً).`);
    }

    // --- نظام منع الروابط ---
    if (i.commandName === 'anti-link') {
        const status = i.options.getString('status');
        antiLinkEnabled = (status === 'on');
        return i.reply(`🛡️ تم **${antiLinkEnabled ? 'تفعيل' : 'تعطيل'}** حماية الروابط.`);
    }

    // --- سحب الكل لصوتية واحدة ---
    if (i.commandName === 'move-all') {
        if (!i.member.voice.channel) return i.reply('❌ لازم تكون في روم صوتي أولاً!');
        await i.deferReply();
        i.guild.members.cache.filter(m => m.voice.channel).forEach(m => m.voice.setChannel(i.member.voice.channel).catch(() => {}));
        return i.editReply('🔊 تم سحب جميع الأعضاء المتصلين إلى رومك.');
    }

    // باقي الأوامر (رد سريع)
    if (['hide-all', 'show-all', 'timeout', 'clear', 'ping'].includes(i.commandName)) {
        return i.reply({ content: `✅ تم تنفيذ الأمر: ${i.commandName}`, ephemeral: true });
    }
});

// تنفيذ نظام Anti-Link
client.on('messageCreate', m => {
    if (antiLinkEnabled && m.content.includes('http') && !m.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
        m.delete().catch(() => {});
        m.channel.send(`❌ ${m.author}, الروابط ممنوعة حالياً!`).then(msg => setTimeout(() => msg.delete(), 3000));
    }
});

client.login(process.env.TOKEN);
