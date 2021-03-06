import React from 'react';
import { PropTypes } from 'prop-types';
// MobX
import { computed, observable } from 'mobx';
import { observer } from 'mobx-react';
// Models
import rListModel from "./rList.model";


@observer
class RList extends React.Component {


	static displayName = 'RList.component';

	static propTypes = {
		scrollable: PropTypes.bool,
		height: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
	};

	static defaultProps = {
		scrollable: false,
		height: 'auto'
	};


	@observable containerWrapperRef = React.createRef();

	@observable containerRef = React.createRef();

	@observable itemRef = React.createRef();


	componentDidMount() {
		if(!this.containerRef.current) return;

		rListModel.update({
			itemWidth:  this.itemRef.current.offsetWidth,
			itemHeight: this.itemRef.current.offsetHeight,
			listScrollTop: window.pageYOffset - this.containerRef.current.offsetTop,
			containerWidth: this.containerRef.current.offsetWidth
		});

		this.scrollContainer.addEventListener('scroll', (event)=> {
			const scrollTop = event.target.scrollTop || window.pageYOffset;
			rListModel.update({
				listScrollTop: scrollTop - this.containerRef.current.offsetTop
			});
		});

		window.addEventListener('resize', (event)=> {
			rListModel.update({
				itemWidth:  this.itemRef.current.offsetWidth,
				itemHeight: this.itemRef.current.offsetHeight,
				containerWidth: this.containerRef.current.offsetWidth
			});
		});
	}


	@computed get scrollContainer() { return this.props.scrollable ? this.containerWrapperRef.current : window; };

	@computed get rList() { return rListModel.rList; };

	@computed get itemsInRow() { return Math.floor(this.rList.containerWidth / this.rList.itemWidth); };

	@computed get widthOfPart() { return this.itemsInRow * this.rList.itemWidth; };

	@computed get rowsInPart() { return Math.floor(window.innerHeight / this.rList.itemHeight); };

	// TODO: Recheck this
	@computed get itemsInPart() {
		let itemsInPart = this.rowsInPart * this.itemsInRow;
		return itemsInPart;
		if(itemsInPart % 2) return itemsInPart;
		if(!(itemsInPart % 2)) return itemsInPart + (this.itemsInRow - (itemsInPart % 2));
	};

	@computed get heightOfPart() { return this.rowsInPart * this.rList.itemHeight; };

	@computed get partsCount() { return Math.ceil(this.items.length / this.itemsInPart) };

	@computed get gameParts() { return this.chunk(this.items, this.itemsInPart); };

	@computed get visibleCurrentPart() {
		const visibleCurrentValue = Math.ceil(this.rList.listScrollTop / this.heightOfPart);
		return visibleCurrentValue > 0 ? visibleCurrentValue : 0;
	};


	get items() { return this.props.children.type ? [this.props.children] : this.props.children; };

	get fakeItem() { return { ...this.items[0], ref: this.itemRef }; };


	chunk(array, chunkSize) {
		return [].concat.apply([], array.map(function (elem, i) {
			return i % chunkSize ? [] : [array.slice(i, i + chunkSize)];
		}));
	}


	times(times = 10, fn=()=>{}) { return Array.apply(null, new Array(times)).map(fn); };

	isInRange(x, min, max) { return ((x-min)*(x-max) <= 0); };


	isRenderPart(partNumber) {
		// rendering of previous, current, next parts in relation to currentVisible part
		return this.isInRange(this.visibleCurrentPart, partNumber-1, partNumber+2);
	}

	
	
	renderPart(partNumber) {
		this.isRenderPart(partNumber) ?
			this.visibleCurrentPart === partNumber ?
				console.log(`%c renderGamePart №, ${partNumber}`, "background: lightblue")
				:
				console.log(`%c renderGamePart №, ${partNumber}`, "background: yellow")
			:
			console.log(`%c renderGamePart №, ${partNumber}`, "background: grey");

		if(!this.isRenderPart(partNumber)) return this.renderPlaceholder();

		return this.gameParts[partNumber].map((item, index)=> item);
	}


	renderParts() {
		console.log("======= render =======");
		return (
			<div className="r-list-parts">
				{ this.times(this.partsCount, (item, partNumber)=> {
					return this.renderPart(partNumber);
				}) }
			</div>
		);
	}


	renderPlaceholder() {
		return (
			<div className="r-list-placeholder" style={{
				width: this.widthOfPart,
				height: this.heightOfPart,
				background: "red"
			}} />
		);
	}


	render() {
		if(!this.props.children) return <div className="r-list">empty</div>;

		return (
			<div>
				{ this.containerRef.current ?
					<div style={{ position: "fixed", bottom: 5, zIndex: "1", right: 5, background: "lightgray", padding: 10 }}>
						<p>window.pageYOffset: { window.pageYOffset }</p>
						<p>listScrollTop: { this.rList.listScrollTop }</p>
						<p>itemWidth: { this.rList.itemWidth }</p>
						<p>itemHeight: { this.rList.itemHeight }</p>
						<p>itemsInRow: { this.itemsInRow }</p>
						<p>widthOfPart: { this.widthOfPart }</p>
						<p>heightOfPart: { this.heightOfPart }</p>
						<p>rowsInPart: { this.rowsInPart }</p>
						<p>itemsInPart: { this.itemsInPart }</p>
						<p>partsCount: { this.partsCount }</p>
						<p>visibleCurrentPart: { this.visibleCurrentPart }</p>
					</div>
				: null }

				<div style={{
						height: this.props.scrollable ? this.props.height : 'auto',
						overflow: this.props.scrollable ? 'hidden' : 'auto'
				}}>
					<div ref={ this.containerWrapperRef }
						 style={{
							overflow: this.props.scrollable ? 'scroll' : 'auto',
							height: this.props.scrollable ? '100%' : 'auto'
					}}>
						<div className="r-list" ref={ this.containerRef }>
							{ this.containerRef.current ? this.renderParts() : null }
						</div>
					</div>
				</div>

				{ !this.containerRef.current ?
				<div className="r-list" style={{ opacity: 0 }}>
					{ this.fakeItem }
				</div>
				: null }
			</div>
		);
	}
}

export default RList;