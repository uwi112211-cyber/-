const { Client, GatewayIntentBits, PermissionsBitField, EmbedBuilder, REST, Routes, SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

// قاعدة بيانات التفاعل
const messagesDB = new Map(); 

// تسجيل الأوامر
const commands = [
  new SlashCommandBuilder().setName('embed').setDescription('إنشاء رسالة إيمبد احترافية'), // الأمر الجديد
  new SlashCommandBuilder().setName('top').setDescription('عرض قائمة الأكثر تفاعلاً')
    .addStringOption(opt => opt.setName('type').setDescription('نوع التوب').setRequired(true)
    .addChoices({ name: 'يومي', value: 'daily' }, { name: 'أسبوعي', value: 'weekly' }, { name: 'عام', value: 'total' })),
  new SlashCommandBuilder().setName('ban').setDescription('حظر عضو').addUserOption(o => o.setName('user').setDescription('العضو').setRequired(true)),
  new SlashCommandBuilder().setName('mute').setDescription('إسكات عضو').addUserOption(o => o.setName('user').setDescription('العضو').setRequired(true)).addIntegerOption(o => o.setName('duration').setDescription('بالدقائق').setRequired(true)),
  new SlashCommandBuilder().setName('clear').setDescription('مسح الرسائل').addIntegerOption(o => o.setName('amount').setDescription('العدد').setRequired(true)),
  new SlashCommandBuilder().setName('avatar').setDescription('عرض أفاتار عضو').addUserOption(o => o.setName('user').setDescription('العضو')),
].map(cmd => cmd.toJSON());

client.once('ready', async () => {
  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
  await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
  console.log(`✅ البوت جاهز: تم إضافة صانع الإيمبد!`);
});

// --- 1. نظام التفاعل والأوتو مود ---
client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;

  const userId = message.author.id;
  if (!messagesDB.has(userId)) messagesDB.set(userId, { daily: 0, weekly: 0, total: 0, username: message.author.username });
  const stats = messagesDB.get(userId);
  stats.daily++; stats.weekly++; stats.total++;

  if (['السلام عليكم', 'سلام عليكم'].some(g => message.content.includes(g))) return message.reply('وعليكم السلام ورحمة الله وبركاته ❤️');

  if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
    if (/(https?:\/\/[^\s]+)/g.test(message.content)) {
        await message.delete().catch(() => {});
        return message.channel.send(`⚠️ ${message.author} الروابط ممنوعة!`).then(m => setTimeout(() => m.delete(), 3000));
    }
  }
});

// --- 2. التعامل مع التفاعلات (أوامر السلاش والمودال) ---
client.on('interactionCreate', async (interaction) => {
  
  // فتح نافذة تصميم الإيمبد
  if (interaction.isChatInputCommand() && interaction.commandName === 'embed') {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return interaction.reply({ content: 'للإدارة فقط!', ephemeral: true });

    const modal = new ModalBuilder().setCustomId('embed_modal').setTitle('صانع الرسائل الاحترافية');
    const titleInput = new TextInputBuilder().setCustomId('embed_title').setLabel("عنوان الرسالة").setStyle(TextInputStyle.Short).setRequired(true);
    const descInput = new TextInputBuilder().setCustomId('embed_desc').setLabel("محتوى الرسالة").setStyle(TextInputStyle.Paragraph).setRequired(true);
    const colorInput = new TextInputBuilder().setCustomId('embed_color').setLabel("اللون (اختياري: Red, Blue, Gold)").setStyle(TextInputStyle.Short).setRequired(false);

    modal.addComponents(new ActionRowBuilder().addComponents(titleInput), new ActionRowBuilder().addComponents(descInput), new ActionRowBuilder().addComponents(colorInput));
    await interaction.showModal(modal);
  }

  // معالجة البيانات المرسلة من النافذة
  if (interaction.isModalSubmit() && interaction.customId === 'embed_modal') {
    const title = interaction.fields.getTextInputValue('embed_title');
    const desc = interaction.fields.getTextInputValue('embed_desc');
    const color = interaction.fields.getTextInputValue('embed_color') || 'Blue';

    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(desc)
      .setColor(color)
      .setFooter({ text: `بواسطة: ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
      .setTimestamp();

    await interaction.channel.send({ embeds: [embed] });
    await interaction.reply({ content: '✅ تم إرسال الإيمبد بنجاح!', ephemeral: true });
  }

  // باقي أوامر السلاش (top, ban, avatar...)
  if (interaction.isChatInputCommand()) {
      const { commandName, options } = interaction;
      if (commandName === 'avatar') {
        const user = options.getUser('user') || interaction.user;
        const embed = new EmbedBuilder().setTitle(`أفاتار ${user.username}`).setImage(user.displayAvatarURL({ dynamic: true, size: 1024 })).setColor('Blue');
        return interaction.reply({ embeds: [embed] });
      }
      if (commandName === 'top') {
        const type = options.getString('type');
        const sorted = Array.from(messagesDB.values()).sort((a, b) => b[type] - a[type]).slice(0, 10);
        const desc = sorted.map((u, i) => `**#${i + 1}** | ${u.username} - \`${u[type]}\` رسالة`).join('\n');
        return interaction.reply({ embeds: [new EmbedBuilder().setTitle('🏆 قائمة التفاعل').setDescription(desc || 'لا بيانات').setColor('Gold')] });
      }
  }
});

client.login(process.env.TOKEN);
