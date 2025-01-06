document.addEventListener('DOMContentLoaded', function() {
    // 设置默认字体
    document.body.style.fontFamily = 'Qomolangma-Uchen Sarchung, "Microsoft Himalaya", "Noto Sans Tibetan", sans-serif';
    
    const fontUpload = document.getElementById('fontUpload');
    const noteEditor = document.getElementById('noteEditor');
    const fontList = document.getElementById('fontList');
    const fontSizeSlider = document.getElementById('fontSize');
    const fontSizeDisplay = document.getElementById('fontSizeDisplay');
    
    // 存储上传的字体文件
    const fontFiles = {};

    // 字体上传处理
    fontUpload.addEventListener('change', function(e) {
        const files = e.target.files;
        
        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const fontName = file.name.split('.')[0];
                const fontFace = new FontFace(fontName, e.target.result);
                
                // 存储字体文件
                fontFiles[fontName] = file;
                
                // 加载字体
                fontFace.load().then(function(loadedFace) {
                    // 添加到文档的字体集合中
                    document.fonts.add(loadedFace);
                    
                    // 创建字体按钮
                    const fontButton = document.createElement('button');
                    fontButton.className = 'font-item';
                    fontButton.textContent = fontName;
                    fontButton.style.fontFamily = fontName;
                    
                    // 添加点击事件
                    fontButton.addEventListener('click', function() {
                        // 移除其他字体按钮的激活状态
                        document.querySelectorAll('.font-item').forEach(btn => {
                            btn.classList.remove('active');
                        });
                        // 激活当前字体按钮
                        this.classList.add('active');
                        
                        // 应用字体到编辑器
                        noteEditor.style.fontFamily = `"${fontName}", sans-serif`;
                        console.log('Applying font:', fontName); // 调试用
                    });
                    
                    // 添加到字体列表
                    fontList.appendChild(fontButton);
                    console.log('Font loaded:', fontName); // 调试用
                }).catch(function(error) {
                    console.error('Font loading failed:', error);
                });
            };
            reader.readAsArrayBuffer(file);
        });
    });

    // 初始化编辑器
    if (noteEditor) {
        // 设置初始样式
        noteEditor.classList.add('note');
        
        // 确保编辑器可以获得焦点
        noteEditor.addEventListener('click', function() {
            this.focus();
        });
    }

    // 样式切换功能
    const styleButtons = document.querySelectorAll('.style-btn');
    styleButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const style = this.dataset.style;
            console.log('Switching to style:', style); // 调试用
            
            // 移除所有样式类
            noteEditor.className = 'note';
            // 添加新样式
            noteEditor.classList.add(style);
            
            // 更新按钮状态
            styleButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // 编辑功能
    const editButtons = {
        'boldBtn': 'bold',
        'italicBtn': 'italic',
        'underlineBtn': 'underline',
        'strikeBtn': 'strikeThrough',
        'alignLeftBtn': 'justifyLeft',
        'alignCenterBtn': 'justifyCenter',
        'alignRightBtn': 'justifyRight',
        'alignJustifyBtn': 'justifyFull',
        'bulletListBtn': 'insertUnorderedList',
        'numberListBtn': 'insertOrderedList',
        'indentBtn': 'indent',
        'outdentBtn': 'outdent'
    };

    Object.entries(editButtons).forEach(([id, command]) => {
        const button = document.getElementById(id);
        if (button) {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                noteEditor.focus();
                document.execCommand(command, false, null);
                this.classList.toggle('active');
                console.log('Executing command:', command); // 调试用
            });
        }
    });

    // 颜色工具
    const textColor = document.getElementById('textColor');
    const bgColor = document.getElementById('bgColor');

    if (textColor) {
        textColor.addEventListener('input', function() {
            noteEditor.focus();
            document.execCommand('foreColor', false, this.value);
            console.log('Setting text color:', this.value); // 调试用
        });
    }

    if (bgColor) {
        bgColor.addEventListener('input', function() {
            noteEditor.focus();
            document.execCommand('backColor', false, this.value);
            console.log('Setting background color:', this.value); // 调试用
        });
    }

    if (fontSizeSlider && fontSizeDisplay) {
        // 更新字体大小的函数
        const updateFontSize = (size) => {
            noteEditor.style.fontSize = size + 'px';
            fontSizeDisplay.textContent = size + 'px';
        };

        // 监听滑块值变化
        fontSizeSlider.addEventListener('input', function() {
            updateFontSize(this.value);
        });

        // 初始化字体大小
        updateFontSize(fontSizeSlider.value);
    }

    // 图片下载功能
    document.getElementById('downloadImage').addEventListener('click', function() {
        // 创建一个临时容器来复制编辑器内容
        const tempContainer = document.createElement('div');
        tempContainer.style.cssText = `
            width: 800px;
            padding: 40px;
            background-color: ${getComputedStyle(noteEditor).backgroundColor};
            font-family: ${noteEditor.style.fontFamily};
            font-size: ${noteEditor.style.fontSize};
            line-height: 2.5;
            letter-spacing: 0.1em;
            word-spacing: 0.2em;
            text-align: left;
            color: ${noteEditor.style.color};
        `;
        
        // 复制内容
        tempContainer.innerHTML = noteEditor.innerHTML;
        document.body.appendChild(tempContainer);
        
        // 使用 html2canvas 生成图片
        html2canvas(tempContainer, {
            backgroundColor: null,
            scale: 2, // 提高输出质量
            useCORS: true,
            logging: false
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = 'tibetan-text.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
            
            // 移除临时容器
            document.body.removeChild(tempContainer);
        });
    });

    // 字体下载功能
    document.getElementById('downloadFont').addEventListener('click', function() {
        // 获取当前使用的字体
        const currentFont = noteEditor.style.fontFamily.replace(/["']/g, '').split(',')[0];
        const fontFile = fontFiles[currentFont];
        
        if (fontFile) {
            const link = document.createElement('a');
            link.download = fontFile.name;
            link.href = URL.createObjectURL(fontFile);
            link.click();
            URL.revokeObjectURL(link.href);
        } else {
            alert('No font file available for download');
        }
    });

    // 预设字体列表 - 直接使用字体文件名
    const presetFonts = [
        'Qomolangma-Uchen.ttf',
        'Qomolangma-Betsu.ttf',
        'Qomolangma-Chuyig.ttf',
        'Qomolangma-Drutsa.ttf',
        'Qomolangma-Dunhuang.ttf',
        'Qomolangma-Edict.ttf',
        'Qomolangma-Title.ttf',
        'Qomolangma-Tsumachu.ttf',
        'Qomolangma-Tsuring.ttf',
        'Qomolangma-Tsutong.ttf'
        // 添加更多字体文件名
    ];

    // 加载预设字体
    async function loadPresetFonts() {
        for (const fontFile of presetFonts) {
            try {
                // 从文件名中提取字体名（去掉.ttf扩展名）
                const fontName = fontFile.split('.')[0];
                const fontFace = new FontFace(fontName, `url(fonts/${fontFile})`);
                const loadedFont = await fontFace.load();
                document.fonts.add(loadedFont);
                
                // 创建字体按钮
                const fontButton = document.createElement('button');
                fontButton.className = 'font-item';
                fontButton.textContent = fontName;  // 显示不带扩展名的字体名
                fontButton.style.fontFamily = fontName;
                
                // 添加点击事件
                fontButton.addEventListener('click', function() {
                    document.querySelectorAll('.font-item').forEach(btn => {
                        btn.classList.remove('active');
                    });
                    this.classList.add('active');
                    noteEditor.style.fontFamily = `"${fontName}", sans-serif`;
                });
                
                fontList.appendChild(fontButton);
                
            } catch (error) {
                console.error(`Failed to load font ${fontFile}:`, error);
            }
        }
    }

    // 在页面加载时调用
    loadPresetFonts();
}); 