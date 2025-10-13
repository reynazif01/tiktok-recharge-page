document.addEventListener('DOMContentLoaded', () => {
    // --- LẤY CÁC PHẦN TỬ ---
    const userIdContainer = document.querySelector('.user-id-container');
    const userIdInput = document.getElementById('user-id-input');
    const fixedCoinPackages = document.querySelectorAll('.coin-package:not(.custom-input-package)');
    const customInputPackage = document.querySelector('.custom-input-package');
    const customCoinInputField = document.getElementById('custom-coin-input-field');
    const customPriceDisplay = document.getElementById('custom-price-display');
    const rechargeButton = document.getElementById('recharge-btn');
    const rechargeInterface = document.getElementById('recharge-interface');
    const successScreen = document.getElementById('success-screen');
    const rechargeAgainButton = document.getElementById('recharge-again-btn');
    const successUserId = document.getElementById('success-user-id');
    const successCoinAmount = document.getElementById('success-coin-amount');
    const paymentModalOverlay = document.getElementById('payment-modal-overlay');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const payNowBtn = document.getElementById('pay-now-btn');
    const modalUserId = document.getElementById('modal-user-id');
    const modalPrice = document.getElementById('modal-price');
    const paymentOptions = document.querySelectorAll('.payment-option');
    const processingOverlay = document.getElementById('processing-overlay');
    const countdownTimer = document.getElementById('countdown-timer');
    const savedCardsModalOverlay = document.getElementById('saved-cards-modal-overlay');
    const closeSavedCardsBtn = document.getElementById('close-saved-cards-btn');
    const cardPaymentOption = document.querySelector('.payment-option[data-method="Card"]');
    const savedCardItems = document.querySelectorAll('.saved-card-item');
    const cardDisplayText = document.getElementById('card-display-text');
    const cardDisplayIcon = document.getElementById('card-display-icon');
    const savedVisaText = document.getElementById('saved-visa-text');
    const savedMastercardText = document.getElementById('saved-mastercard-text');
    const modalCoinAmountText = document.getElementById('modal-coin-amount-text');
    const modalCoinPriceText = document.getElementById('modal-coin-price-text');
    const modalUserAvatar = document.getElementById('modal-user-avatar');
    const currentBalanceElement = document.getElementById('current-balance');
    let currentBalance = 0;

    let selectedPackage = null;
    let timerInterval = null;
    const COIN_PRICE_RATE = 0.01057;

    const initialBalanceText = currentBalanceElement.textContent.replace(/,/g, '');
    currentBalance = parseInt(initialBalanceText, 10);

    // --- CÁC HÀM ---
    
    function resetInterface() {
        if (selectedPackage && selectedPackage.classList) {
            selectedPackage.classList.remove('selected');
        }
        selectedPackage = null;
        userIdInput.value = '';
        rechargeButton.disabled = true;
        rechargeInterface.classList.remove('hidden');
        successScreen.classList.add('hidden');
        paymentModalOverlay.classList.add('hidden');
        savedCardsModalOverlay.classList.add('hidden');
        if (timerInterval) clearInterval(timerInterval);
        
        customCoinInputField.value = '';
        customPriceDisplay.textContent = '30-2,500,000';
        customPriceDisplay.classList.add('range-text');
        
        cardDisplayText.textContent = 'Add Credit Or Debit Card';
        cardDisplayIcon.src = 'https://icongr.am/fontawesome/credit-card.svg?color=808080';
        if (modalUserAvatar) {
            modalUserAvatar.src = 'https://icongr.am/clarity/avatar.svg?color=cccccc';
        }
    }

    function deselectAllPackages() {
        fixedCoinPackages.forEach(p => p.classList.remove('selected'));
        customInputPackage.classList.remove('selected');
        selectedPackage = null;
    }
    
    function initializeRandomCards() {
        const visaLastFour = Math.floor(Math.random() * 9000) + 1000;
        const visaText = `Visa **** ${visaLastFour}`;
        const visaItem = document.querySelector('.saved-card-item[data-card-name^="Visa"]');
        if(visaItem) visaItem.dataset.cardName = visaText;
        if(savedVisaText) savedVisaText.textContent = visaText;

        const mastercardLastFour = Math.floor(Math.random() * 9000) + 1000;
        const mastercardText = `Mastercard **** ${mastercardLastFour}`;
        const mastercardItem = document.querySelector('.saved-card-item[data-card-name^="Mastercard"]');
        if(mastercardItem) mastercardItem.dataset.cardName = mastercardText;
        if(savedMastercardText) savedMastercardText.textContent = mastercardText;
    }

    function openPaymentModal() {
        if (userIdInput.value.trim() === '') {
            alert('Please enter a User ID!');
            userIdContainer.classList.add('error');
            return;
        }
        if (!selectedPackage) {
            alert('Please select a package or enter a custom amount.');
            return;
        }
        
        const username = userIdInput.value.trim();
        modalUserId.textContent = `@${username}`;
        modalPrice.textContent = selectedPackage.dataset.price;
        modalCoinAmountText.textContent = selectedPackage.dataset.amount;
        modalCoinPriceText.textContent = selectedPackage.dataset.price;
        
        paymentModalOverlay.classList.remove('hidden');
    }

    function startTimer(duration, display) {
        let timer = duration, minutes, seconds;
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            minutes = parseInt(timer / 60, 10);
            seconds = parseInt(timer % 60, 10);
            minutes = minutes < 10 ? "0" + minutes : minutes;
            seconds = seconds < 10 ? "0" + seconds : seconds;
            display.textContent = minutes + ":" + seconds;
            if (--timer < 0) clearInterval(timerInterval);
        }, 1000);
    }

    // --- GÁN SỰ KIỆN ---
    fixedCoinPackages.forEach(packageElement => {
        packageElement.addEventListener('click', () => {
            deselectAllPackages();
            packageElement.classList.add('selected');
            selectedPackage = packageElement;
            rechargeButton.disabled = false;
        });
    });

    customInputPackage.addEventListener('click', () => {
        deselectAllPackages();
        customInputPackage.classList.add('selected');
        customCoinInputField.focus();
    });

    customCoinInputField.addEventListener('input', () => {
        if (!customInputPackage.classList.contains('selected')) {
            deselectAllPackages();
            customInputPackage.classList.add('selected');
        }

        const rawValue = customCoinInputField.value.replace(/,/g, '');
        const amount = parseInt(rawValue, 10);

        if (isNaN(amount) || amount < 30) {
            customPriceDisplay.textContent = '30-2,500,000';
            customPriceDisplay.classList.add('range-text');
            rechargeButton.disabled = true;
            selectedPackage = null;
            if (isNaN(amount)) {
                customCoinInputField.value = '';
            }
        } else {
            const cursorPosition = customCoinInputField.selectionStart;
            const originalLength = customCoinInputField.value.length;
            customCoinInputField.value = amount.toLocaleString('en-US');
            const newLength = customCoinInputField.value.length;
            customCoinInputField.setSelectionRange(cursorPosition + newLength - originalLength, cursorPosition + newLength - originalLength);

            const price = amount * COIN_PRICE_RATE;
            const formattedPrice = price.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
            const priceString = `US$${formattedPrice}`;

            customPriceDisplay.textContent = priceString;
            customPriceDisplay.classList.remove('range-text');
            
            selectedPackage = {
                dataset: { amount: amount.toLocaleString('en-US'), price: priceString }
            };
            rechargeButton.disabled = false;
        }
    });

    rechargeButton.addEventListener('click', openPaymentModal);
    closeModalBtn.addEventListener('click', () => paymentModalOverlay.classList.add('hidden'));

    paymentOptions.forEach(option => {
        option.addEventListener('click', () => {
            paymentOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            if (option.dataset.method === 'Card') {
                savedCardsModalOverlay.classList.remove('hidden');
            }
        });
    });

    closeSavedCardsBtn.addEventListener('click', () => savedCardsModalOverlay.classList.add('hidden'));

    savedCardItems.forEach(item => {
        item.addEventListener('click', () => {
            if (item.classList.contains('add-new-card')) {
                alert('"Add new card" functionality is not implemented in this demo.');
                return;
            }
            const cardName = item.dataset.cardName;
            const cardLogoSrc = item.dataset.cardLogoSrc;
            
            cardDisplayText.textContent = cardName;
            cardDisplayIcon.src = cardLogoSrc;
            
            savedCardsModalOverlay.classList.add('hidden');
        });
    });

    payNowBtn.addEventListener('click', () => {
        paymentModalOverlay.classList.add('hidden');
        processingOverlay.classList.remove('hidden');
        
        startTimer(299, countdownTimer);
        setTimeout(() => {
            if (timerInterval) clearInterval(timerInterval);

            const amountToAdd = parseInt(selectedPackage.dataset.amount.replace(/,/g, ''), 10);
            
            currentBalance += amountToAdd;
            
            currentBalanceElement.textContent = currentBalance.toLocaleString('en-US');

            successUserId.textContent = `@${userIdInput.value}`;
            successCoinAmount.textContent = selectedPackage.dataset.amount;
            processingOverlay.classList.add('hidden');
            rechargeInterface.classList.add('hidden');
            successScreen.classList.remove('hidden');
        }, 5000);
    });

    userIdInput.addEventListener('input', () => {
        if (userIdInput.value.trim() !== '') {
            userIdContainer.classList.remove('error');
        }
    });

    rechargeAgainButton.addEventListener('click', resetInterface);
    
    initializeRandomCards();

});