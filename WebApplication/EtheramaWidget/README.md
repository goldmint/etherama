# init widget

```html
<div id="etherama-widget"></div>
<script type="text/javascript">
    window.MintaramaWidget('#etherama-widget', {
        tokenID: 1,
        refAddress: '0xa439194a96765934cf8f3EBEf859613cc49e8B56' // optional
    });
</script>
```


# stylization classes

## main widget

.gold-widget - main widget class. It's being used for setting font family, font size, top and bottom borders

.gold-widget .gold-buttons__button - It's being used for stylization sell and buy buttons

.gold-container .gold-info-price-separator - It's being used for vertical line stylization between buy and sell blocks

## modal window

.gold-modal-container - It's being used for setting font family for modal window

### - buy/sell modal

.gold-modal-container .gold-modal-header - It's being used for setting header color

.gold-modal-container .gold-modal-header__close svg - It's being used for setting color of close button in modal window

.gold-modal-container .gold-modal-switch - It's being used for buy/sell buttons stylization in switcher block

.gold-modal-container .gold-modal-switch__item - It's being used for buy/sell buttons stylization in switcher block

.gold-modal-container .gold-modal-switch__item.active - It's being used for active button stylization

.gold-modal-container .gold-svg-icon - It's being used for setting Eth icon color

.gold-modal-container .gold-modal-info-icon svg - It's being used for setting tooltip icon color

.gold-modal-container .gold-buttons__button - It's being used for buy and sell buttons stylization

.gold-modal-container .gold-buttons__button:hover

### - success modal
.gold-modal-container .gold-modal-success-icon svg  - It's being used for setting success icon color

### - reject modal 
.gold-modal-container .gold-modal-rejected-icon svg - It's being used for setting reject icon color

### - error modal
.gold-modal-container .gold-modal-error-icon svg - It's being used for setting error icon color

### - different
.gold-modal-container .gold-modal-action-btn-cont button - It's being used for colors setting of success, reject and error button in modal window

.gold-modal-container .gold-modal-header__back svg - It's being used for setting back icon color in modal window header